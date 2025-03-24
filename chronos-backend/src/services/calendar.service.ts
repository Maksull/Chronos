import { AppDataSource } from '@/database/data-source';
import { Calendar, User, CalendarParticipant, ParticipantRole, CalendarEmailInvite } from '@/entities';
import { CalendarInviteLink } from '@/entities/CalendarInviteLink';
import { seedDefaultCategories } from '@/utils/seedDefaultCategories';
import { CalendarDto, ParticipantWithRoleDto } from '@/types/calendar';
import { EmailService, NotificationService } from '.';
import { randomBytes } from 'crypto';

interface CreateCalendarDto {
    name: string;
    description?: string;
    color: string;
}

interface UpdateCalendarDto {
    name?: string;
    description?: string;
    color?: string;
}

interface CalendarWithRole extends Calendar {
    role?: ParticipantRole;
}

export class CalendarService {
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private userRepository = AppDataSource.getRepository(User);
    private participantRepository = AppDataSource.getRepository(CalendarParticipant);
    private inviteLinkRepository = AppDataSource.getRepository(CalendarInviteLink);
    private emailInviteRepository = AppDataSource.getRepository(CalendarEmailInvite);
    private notificationService: NotificationService;
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
        this.notificationService = new NotificationService();
    }

    async inviteUserByEmail(
        currentUserId: string,
        calendarId: string,
        email: string,
        role: ParticipantRole = ParticipantRole.READER,
        expireInDays?: number,
    ): Promise<CalendarEmailInvite> {
        // Verify calendar exists and check permissions
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.isMain) {
            throw new Error('Cannot invite users to a personal calendar');
        }

        // Check if current user is owner or admin
        const isOwner = calendar.owner.id === currentUserId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId: currentUserId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner or admin can invite users');
            }
        }

        // Check if user with this email already exists
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });

        if (existingUser) {
            // Check if already a participant
            const existingParticipant = await this.participantRepository.findOne({
                where: { calendarId, userId: existingUser.id },
            });

            if (existingParticipant) {
                throw new Error('This user is already a participant in the calendar');
            }

            // Check if there's already a pending invite for this email
            const existingInvite = await this.emailInviteRepository.findOne({
                where: { calendarId, email },
            });

            if (existingInvite) {
                throw new Error('An invitation has already been sent to this email');
            }
        }

        // Generate token and set expiration date
        const token = randomBytes(32).toString('hex');
        let expiresAt: Date | null = null;
        if (expireInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expireInDays);
        }

        // Create email invite record
        const emailInvite = this.emailInviteRepository.create({
            calendar,
            calendarId,
            email,
            role,
            token,
            expiresAt,
        });

        const savedInvite = await this.emailInviteRepository.save(emailInvite);

        // Send invitation email
        await this.sendCalendarInviteEmail(email, calendar.name, token);

        return savedInvite;
    }

    private async sendCalendarInviteEmail(email: string, calendarName: string, token: string): Promise<void> {
        const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/email-invite/${token}`;

        await this.emailService.sendCalendarInviteEmail(email, calendarName, inviteUrl);
    }

    async acceptEmailInvite(userId: string, token: string): Promise<Calendar> {
        const emailInvite = await this.emailInviteRepository.findOne({
            where: { token },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!emailInvite) {
            throw new Error('Invitation not found or invalid');
        }

        if (emailInvite.expiresAt && emailInvite.expiresAt < new Date()) {
            throw new Error('Invitation has expired');
        }

        // Check if calendar still exists
        if (!emailInvite.calendar) {
            throw new Error('Calendar associated with this invitation was not found');
        }

        // Get the user
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify user email matches the invited email
        if (user.email.toLowerCase() !== emailInvite.email.toLowerCase()) {
            throw new Error('This invitation was sent to a different email address');
        }

        const calendar = emailInvite.calendar;

        // Make sure user is not already a participant or owner
        if (calendar.owner.id === userId) {
            throw new Error('You are already the owner of this calendar');
        }

        const existingParticipation = await this.participantRepository.findOne({
            where: { calendarId: calendar.id, userId },
        });

        if (existingParticipation) {
            throw new Error('You are already a participant in this calendar');
        }

        // Add user as a participant with the specified role
        const participant = this.participantRepository.create({
            calendar,
            calendarId: calendar.id,
            user,
            userId,
            role: emailInvite.role,
        });

        await this.participantRepository.save(participant);

        // Delete the email invite after it's been used
        await this.emailInviteRepository.remove(emailInvite);

        // Notify other participants about the new member
        try {
            await this.notificationService.notifyParticipantAdded(
                calendar.owner.id, // Use calendar owner as the initiator for email invites
                calendar.id,
                userId,
                emailInvite.role,
            );
        } catch (error) {
            console.error('Failed to send participant added notifications:', error);
        }

        return calendar;
    }

    async getEmailInviteInfo(token: string): Promise<{ id: string; name: string; email: string }> {
        const emailInvite = await this.emailInviteRepository.findOne({
            where: { token },
            relations: ['calendar'],
        });

        if (!emailInvite) {
            throw new Error('Invitation not found or invalid');
        }

        if (emailInvite.expiresAt && emailInvite.expiresAt < new Date()) {
            throw new Error('Invitation has expired');
        }

        if (!emailInvite.calendar) {
            throw new Error('Calendar associated with this invitation was not found');
        }

        return {
            id: emailInvite.calendar.id,
            name: emailInvite.calendar.name,
            email: emailInvite.email,
        };
    }

    async getCalendarEmailInvites(userId: string, calendarId: string): Promise<CalendarEmailInvite[]> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner or admin can view invites');
            }
        }

        return this.emailInviteRepository.find({
            where: { calendarId },
            order: { createdAt: 'DESC' },
        });
    }

    async deleteEmailInvite(userId: string, inviteId: string): Promise<void> {
        const emailInvite = await this.emailInviteRepository.findOne({
            where: { id: inviteId },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!emailInvite) {
            throw new Error('Invitation not found');
        }

        const isOwner = emailInvite.calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId: emailInvite.calendarId, userId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner or admin can cancel invitations');
            }
        }

        await this.emailInviteRepository.remove(emailInvite);
    }

    async createPersonalCalendar(userId: string): Promise<Calendar> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user already has a main calendar
        const existingMainCalendar = await this.calendarRepository.findOne({
            where: {
                owner: { id: userId },
                isMain: true,
            },
        });

        if (existingMainCalendar) {
            return existingMainCalendar; // User already has a main calendar
        }

        // Create the personal calendar
        const calendar = this.calendarRepository.create({
            name: `${user.username}'s Calendar`,
            description: 'Your personal calendar',
            color: '#4A6FA5', // Default color (can be customized)
            owner: user,
            isMain: true, // This marks it as the main/personal calendar
            isHoliday: false,
            isVisible: true,
        });

        const savedCalendar = await this.calendarRepository.save(calendar);

        // Seed default categories for the new calendar
        await seedDefaultCategories(savedCalendar.id);

        return savedCalendar;
    }

    async createCalendar(userId: string, data: CreateCalendarDto): Promise<Calendar> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const calendar = this.calendarRepository.create({
            ...data,
            owner: user,
            isMain: false,
            isHoliday: false,
            isVisible: true,
        });

        const savedCalendar = await this.calendarRepository.save(calendar);
        await seedDefaultCategories(savedCalendar.id);
        return savedCalendar;
    }

    async updateCalendar(userId: string, calendarId: string, data: UpdateCalendarDto): Promise<Calendar> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Prevent updating main calendar
        if (calendar.isMain) {
            throw new Error('Cannot modify main calendar properties');
        }

        const isOwner = calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            // Only ADMIN role can update calendar details
            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized');
            }
        }

        // Track changed fields for notifications
        const changedFields: string[] = [];

        if (data.name !== undefined && data.name !== calendar.name) {
            changedFields.push('name');
            calendar.name = data.name;
        }

        if (data.description !== undefined && data.description !== calendar.description) {
            changedFields.push('description');
            calendar.description = data.description;
        }

        if (data.color !== undefined && data.color !== calendar.color) {
            changedFields.push('color');
            calendar.color = data.color;
        }

        const updatedCalendar = await this.calendarRepository.save(calendar);

        // Only send notifications if fields actually changed
        if (changedFields.length > 0) {
            try {
                await this.notificationService.notifyCalendarUpdated(userId, calendarId, changedFields);
            } catch (error) {
                console.error('Failed to send calendar update notifications:', error);
                // Continue with the function as the calendar was successfully updated
            }
        }

        return updatedCalendar;
    }

    async toggleCalendarVisibility(userId: string, calendarId: string, isVisible: boolean): Promise<Calendar> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Prevent toggling visibility of main calendar
        if (calendar.isMain) {
            throw new Error('Cannot modify main calendar visibility');
        }

        const isOwner = calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            // Only ADMIN role can toggle visibility
            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized');
            }
        }

        calendar.isVisible = isVisible;
        return this.calendarRepository.save(calendar);
    }

    async getUserCalendars(
        userId: string,
        page: number = 1,
        limit: number = 7,
        visibility: 'visible' | 'hidden' | 'all' = 'all',
    ): Promise<{
        calendars: CalendarWithRole[];
        totalCount: number;
        visibleCount: number;
        hiddenCount: number;
        filteredCount: number; // Add filtered count for pagination
    }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['ownedCalendars'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Count visible and hidden owned calendars
        const ownedCalendars = user.ownedCalendars || [];

        let visibleOwnedCount = 0;
        let hiddenOwnedCount = 0;

        const filteredOwnedCalendars = ownedCalendars.filter(calendar => {
            if (calendar.isVisible) {
                visibleOwnedCount++;
                return visibility === 'visible' || visibility === 'all';
            } else {
                hiddenOwnedCount++;
                return visibility === 'hidden' || visibility === 'all';
            }
        });

        // Get counts for shared calendars
        const visibleSharedCount = await this.participantRepository.count({
            where: {
                userId,
                calendar: {
                    isVisible: true,
                },
            },
            relations: ['calendar'],
        });

        const hiddenSharedCount = await this.participantRepository.count({
            where: {
                userId,
                calendar: {
                    isVisible: false,
                },
            },
            relations: ['calendar'],
        });

        // Calculate total visible and hidden counts
        const visibleCount = visibleOwnedCount + visibleSharedCount;
        const hiddenCount = hiddenOwnedCount + hiddenSharedCount;
        const totalCount = visibleCount + hiddenCount;

        // Calculate the filtered count based on visibility parameter
        let filteredCount = totalCount;
        if (visibility === 'visible') {
            filteredCount = visibleCount;
        } else if (visibility === 'hidden') {
            filteredCount = hiddenCount;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Apply visibility filter to shared calendars query
        const visibilityCondition = visibility === 'all' ? {} : { isVisible: visibility === 'visible' };

        // If we need to fetch some or all owned calendars
        let currentOwnedCount = 0;
        const ownedCalendarsPaginated: Calendar[] = [];

        // Only include owned calendars if they match the visibility filter
        if (filteredOwnedCalendars.length > 0) {
            const ownedSkip = skip;
            const ownedTake = Math.min(limit, filteredOwnedCalendars.length - ownedSkip);

            if (ownedSkip < filteredOwnedCalendars.length && ownedTake > 0) {
                ownedCalendarsPaginated.push(...filteredOwnedCalendars.slice(ownedSkip, ownedSkip + ownedTake));
                currentOwnedCount = ownedCalendarsPaginated.length;
            }
        }

        // For the remaining limit, fetch shared calendars
        let sharedCalendars: CalendarWithRole[] = [];

        if (currentOwnedCount < limit) {
            const remainingLimit = limit - currentOwnedCount;
            const sharedSkip = Math.max(0, skip - filteredOwnedCalendars.length);

            if (sharedSkip >= 0) {
                // Fetch calendars where user is a participant
                const whereCondition: any = { userId };

                if (visibility !== 'all') {
                    whereCondition.calendar = visibilityCondition;
                }

                const participations = await this.participantRepository.find({
                    where: whereCondition,
                    relations: ['calendar', 'calendar.owner'],
                    skip: sharedSkip,
                    take: remainingLimit,
                    order: {
                        createdAt: 'DESC',
                    },
                });

                // Add role information to shared calendars
                sharedCalendars = participations.map(
                    p =>
                        ({
                            ...p.calendar,
                            role: p.role,
                        }) as CalendarWithRole,
                );
            }
        }

        // Combine and return both sets of calendars
        return {
            calendars: [...ownedCalendarsPaginated, ...sharedCalendars],
            totalCount,
            visibleCount,
            hiddenCount,
            filteredCount,
        };
    }

    async getCalendarById(userId: string, calendarId: string): Promise<CalendarDto> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner', 'categories'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;

        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            if (!participantRole) {
                throw new Error('Not authorized');
            }
        }

        // Get participants with their roles
        const participants = await this.getCalendarParticipants(calendarId);

        // Create the DTO with all the data we need
        const calendarDto: CalendarDto = {
            id: calendar.id,
            name: calendar.name,
            description: calendar.description,
            color: calendar.color,
            isMain: calendar.isMain,
            isHoliday: calendar.isHoliday,
            isVisible: calendar.isVisible,
            owner: {
                id: calendar.owner.id,
                username: calendar.owner.username,
                email: calendar.owner.email,
            },
            participants: participants,
            categories: calendar.categories,
            createdAt: calendar.createdAt,
            updatedAt: calendar.updatedAt,
        };

        return calendarDto;
    }

    async deleteCalendar(userId: string, calendarId: string): Promise<void> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.owner.id !== userId) {
            throw new Error('Not authorized');
        }

        if (calendar.isMain || calendar.isHoliday) {
            throw new Error('Cannot delete main or holiday calendar');
        }

        await this.calendarRepository.remove(calendar);
    }

    async createInviteLink(userId: string, calendarId: string, expireInDays?: number): Promise<CalendarInviteLink> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Prevent creating invite links for main calendar
        if (calendar.isMain) {
            throw new Error('Cannot create invite links for personal calendar');
        }

        const isOwner = calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            // Only ADMIN role can create invite links
            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner or admin can create invite links');
            }
        }

        let expiresAt: Date | null = null;
        if (expireInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expireInDays);
        }

        const inviteLink = this.inviteLinkRepository.create({
            calendarId,
            calendar,
            expiresAt,
        });

        const savedInviteLink = await this.inviteLinkRepository.save(inviteLink);
        return this.inviteLinkRepository.findOne({
            where: { id: savedInviteLink.id },
            relations: ['calendar'],
        }) as Promise<CalendarInviteLink>;
    }

    async acceptInvite(userId: string, inviteLinkId: string, role: ParticipantRole = ParticipantRole.READER): Promise<Calendar> {
        const inviteLink = await this.inviteLinkRepository
            .createQueryBuilder('inviteLink')
            .leftJoinAndSelect('inviteLink.calendar', 'calendar')
            .leftJoinAndSelect('calendar.owner', 'owner')
            .where('inviteLink.id = :id', { id: inviteLinkId })
            .getOne();

        if (!inviteLink) {
            throw new Error('Invite link not found or invalid');
        }

        if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
            throw new Error('Invite link has expired');
        }

        if (!inviteLink.calendar) {
            throw new Error('Calendar associated with this invite link was not found');
        }

        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const calendar = inviteLink.calendar;

        // Check if the user is already a participant or owner
        if (calendar.owner.id === userId) {
            throw new Error('You are already the owner of this calendar');
        }

        const existingParticipation = await this.participantRepository.findOne({
            where: { calendarId: calendar.id, userId },
        });

        if (existingParticipation) {
            throw new Error('You are already a participant in this calendar');
        }

        // Add user as a participant with the specified role
        const participant = this.participantRepository.create({
            calendar,
            calendarId: calendar.id,
            user,
            userId,
            role,
        });

        await this.participantRepository.save(participant);

        // Notify other participants about the new member
        try {
            await this.notificationService.notifyParticipantAdded(
                calendar.owner.id, // Use calendar owner as the initiator for self-joins
                calendar.id,
                userId,
                role,
            );
        } catch (error) {
            console.error('Failed to send participant added notifications:', error);
        }

        return calendar;
    }

    async getCalendarInviteLinks(userId: string, calendarId: string): Promise<CalendarInviteLink[]> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            // Only ADMIN role can view invite links
            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner or admin can view invite links');
            }
        }

        return this.inviteLinkRepository.find({
            where: { calendarId },
            order: { createdAt: 'DESC' },
        });
    }

    async deleteInviteLink(userId: string, inviteLinkId: string): Promise<void> {
        const inviteLink = await this.inviteLinkRepository.findOne({
            where: { id: inviteLinkId },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!inviteLink) {
            throw new Error('Invite link not found');
        }

        const isOwner = inviteLink.calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId: inviteLink.calendar.id, userId },
            });

            // Only ADMIN role can delete invite links
            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner or admin can delete invite links');
            }
        }

        await this.inviteLinkRepository.remove(inviteLink);
    }

    async getInviteLinkInfo(inviteLinkId: string): Promise<{ id: string; name: string }> {
        const inviteLink = await this.inviteLinkRepository
            .createQueryBuilder('inviteLink')
            .leftJoinAndSelect('inviteLink.calendar', 'calendar')
            .where('inviteLink.id = :id', { id: inviteLinkId })
            .getOne();

        if (!inviteLink) {
            throw new Error('Invite link not found or invalid');
        }

        if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
            throw new Error('Invite link has expired');
        }

        // Make sure calendar exists before accessing its properties
        if (!inviteLink.calendar) {
            throw new Error('Calendar associated with this invite link was not found');
        }

        return {
            id: inviteLink.calendar.id,
            name: inviteLink.calendar.name,
        };
    }

    async getCalendarParticipants(calendarId: string): Promise<ParticipantWithRoleDto[]> {
        const participants = await this.participantRepository
            .createQueryBuilder('participant')
            .innerJoinAndSelect('participant.user', 'user')
            .where('participant.calendarId = :calendarId', { calendarId })
            .getMany();

        return participants.map(p => ({
            userId: p.user.id,
            username: p.user.username,
            email: p.user.email,
            role: p.role,
        }));
    }

    async updateParticipantRole(currentUserId: string, calendarId: string, participantId: string, role: ParticipantRole): Promise<ParticipantWithRoleDto> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Check authorization - only owner or admin can update roles
        const isOwner = calendar.owner.id === currentUserId;
        let isAdmin = false;

        if (!isOwner) {
            const currentUserRole = await this.participantRepository.findOne({
                where: { calendarId, userId: currentUserId },
            });

            if (!currentUserRole || currentUserRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized to change participant roles');
            }

            isAdmin = true;
        }

        // If an admin is trying to change an owner's role, prevent it
        if (isAdmin && participantId === calendar.owner.id) {
            throw new Error('Cannot change the role of the calendar owner');
        }

        // Find the participant to update
        const participant = await this.participantRepository.findOne({
            where: { calendarId, userId: participantId },
            relations: ['user'],
        });

        if (!participant) {
            throw new Error('Participant not found');
        }

        // Only proceed with notification if role is actually changing
        const roleChanged = participant.role !== role;

        // Update the role
        participant.role = role;
        await this.participantRepository.save(participant);

        // Notify participants if role changed
        if (roleChanged) {
            try {
                // Notify the user whose role was changed specifically
                await this.emailService.sendMail({
                    from: process.env.EMAIL_FROM || 'noreply@example.com',
                    to: participant.user.email,
                    subject: `Your role in ${calendar.name} has been updated`,
                    html: `
                <h1>Calendar Role Update</h1>
                <p>Your role in the calendar <strong>${calendar.name}</strong> has been updated to <strong>${role}</strong>.</p>
                <p>Log in to see your updated permissions.</p>
              `,
                });
            } catch (error) {
                console.error('Failed to send role change notification:', error);
            }
        }

        return {
            userId: participant.user.id,
            username: participant.user.username,
            email: participant.user.email,
            role: participant.role,
        };
    }

    async removeParticipant(currentUserId: string, calendarId: string, participantId: string): Promise<void> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Can't remove the owner
        if (participantId === calendar.owner.id) {
            throw new Error('Cannot remove the calendar owner');
        }

        // Check authorization - only owner or admin can remove participants
        const isOwner = calendar.owner.id === currentUserId;
        if (!isOwner) {
            const currentUserRole = await this.participantRepository.findOne({
                where: { calendarId, userId: currentUserId },
            });

            if (!currentUserRole || currentUserRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized to remove participants');
            }
        }

        // Find the participant to remove
        const participant = await this.participantRepository.findOne({
            where: { calendarId, userId: participantId },
        });

        if (!participant) {
            throw new Error('Participant not found');
        }

        // Remove the participant
        await this.participantRepository.remove(participant);
    }

    async leaveCalendar(userId: string, calendarId: string): Promise<void> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Owner can't leave their own calendar
        if (calendar.owner.id === userId) {
            throw new Error('The owner cannot leave their own calendar');
        }

        // Find the participation
        const participation = await this.participantRepository.findOne({
            where: { calendarId, userId },
        });

        if (!participation) {
            throw new Error('You are not a participant in this calendar');
        }

        // Remove the participation
        await this.participantRepository.remove(participation);
    }
}
