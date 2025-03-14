import { AppDataSource } from '@/database/data-source';
import { Calendar, User, CalendarParticipant, ParticipantRole } from '@/entities';
import { CalendarInviteLink } from '@/entities/CalendarInviteLink';
import { seedDefaultCategories } from '@/utils/seedDefaultCategories';
import { CalendarDto, ParticipantWithRoleDto } from '@/types/calendar';

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

        if (data.name !== undefined) calendar.name = data.name;
        if (data.description !== undefined) calendar.description = data.description;
        if (data.color !== undefined) calendar.color = data.color;

        return this.calendarRepository.save(calendar);
    }

    async toggleCalendarVisibility(userId: string, calendarId: string, isVisible: boolean): Promise<Calendar> {
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

            // Only ADMIN role can toggle visibility
            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized');
            }
        }

        if (calendar.isMain) {
            throw new Error('Cannot modify main calendar visibility');
        }

        calendar.isVisible = isVisible;
        return this.calendarRepository.save(calendar);
    }

    async getUserCalendars(userId: string): Promise<CalendarWithRole[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['ownedCalendars'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        const ownedCalendars = user.ownedCalendars || [];

        // Fetch calendars where user is a participant and their roles
        const participations = await this.participantRepository.find({
            where: { userId },
            relations: ['calendar', 'calendar.owner'],
        });

        // Add role information to shared calendars
        const sharedCalendars = participations.map(p => {
            // Create a new object that includes the calendar properties and the role
            return {
                ...p.calendar,
                role: p.role,
            } as CalendarWithRole;
        });

        // Combine owned and shared calendars
        return [...ownedCalendars, ...sharedCalendars];
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
        // Default to READER when accepting an invite
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

        // Update the role
        participant.role = role;
        await this.participantRepository.save(participant);

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
