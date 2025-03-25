import { AppDataSource } from '@/database/data-source';
import { Event, EventCategory, Calendar, User, CalendarParticipant, ParticipantRole, EventParticipant, EventEmailInvite } from '@/entities';
import { In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { NotificationService, EmailService } from '.';
import { randomBytes } from 'crypto';

export interface CreateEventDto {
    name: string;
    categoryId: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    color?: string;
}

export interface UpdateEventDto {
    name?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    color?: string;
    isCompleted?: boolean;
}

export interface InviteEventParticipantDto {
    emails: string[];
}

export class EventService {
    private eventRepository = AppDataSource.getRepository(Event);
    private categoryRepository = AppDataSource.getRepository(EventCategory);
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private userRepository = AppDataSource.getRepository(User);
    private calendarParticipantRepository = AppDataSource.getRepository(CalendarParticipant);
    private eventParticipantRepository = AppDataSource.getRepository(EventParticipant);
    private eventEmailInviteRepository = AppDataSource.getRepository(EventEmailInvite);
    private notificationService: NotificationService;
    private emailService: EmailService;

    constructor() {
        this.notificationService = new NotificationService();
        this.emailService = new EmailService();
    }

    async getEventsByCalendarId(userId: string, calendarId: string, startDate?: Date, endDate?: Date, categoryIds?: string[]): Promise<Event[]> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;

        if (!isOwner) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId, userId },
            });

            if (!participantRole) {
                throw new Error('Not authorized');
            }
        }

        const conditions: any = {
            calendar: { id: calendarId },
        };

        // Add category filter if provided
        if (categoryIds && categoryIds.length > 0) {
            conditions.category = { id: In(categoryIds) };
        }

        if (startDate && endDate) {
            conditions.startDate = LessThanOrEqual(endDate);
            conditions.endDate = MoreThanOrEqual(startDate);
        } else if (startDate) {
            conditions.startDate = MoreThanOrEqual(startDate);
        } else if (endDate) {
            conditions.startDate = LessThanOrEqual(endDate);
        }

        return this.eventRepository.find({
            where: conditions,
            order: { startDate: 'ASC' },
            relations: ['creator', 'category', 'participants', 'participants.user'],
        });
    }

    async createEvent(userId: string, calendarId: string, data: CreateEventDto): Promise<Event> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId, userId },
            });

            if (!participantRole || (participantRole.role !== ParticipantRole.ADMIN && participantRole.role !== ParticipantRole.CREATOR)) {
                throw new Error('Not authorized');
            }
        }

        const creator = await this.userRepository.findOneBy({ id: userId });
        if (!creator) {
            throw new Error('User not found');
        }

        const category = await this.categoryRepository.findOne({
            where: { id: data.categoryId, calendar: { id: calendarId } },
        });

        if (!category) {
            throw new Error('Category not found');
        }

        const event = this.eventRepository.create({
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            description: data.description,
            color: data.color,
            calendar,
            category,
            creator,
            isCompleted: false,
        });

        const savedEvent = await this.eventRepository.save(event);

        // Add only the creator as a participant automatically
        await this.addCreatorToEvent(userId, savedEvent.id);

        try {
            await this.notificationService.notifyEventCreated(userId, calendarId, savedEvent);
        } catch (error) {
            console.error('Failed to send event creation notifications:', error);
        }

        const createdEvent = await this.eventRepository.findOne({
            where: { id: savedEvent.id },
            relations: ['creator', 'category', 'participants', 'participants.user'],
        });

        if (!createdEvent) {
            throw new Error('Failed to retrieve created event');
        }

        return createdEvent;
    }
    private async addCreatorToEvent(creatorId: string, eventId: string): Promise<void> {
        const eventParticipant = this.eventParticipantRepository.create({
            eventId,
            userId: creatorId,
            hasConfirmed: true, // Auto-confirm for the creator
        });

        await this.eventParticipantRepository.save(eventParticipant);
    }

    async updateEvent(userId: string, eventId: string, data: UpdateEventDto): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator', 'category', 'participants', 'participants.user'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        const isCreator = event.creator.id === userId;
        const isCalendarOwner = event.calendar.owner.id === userId;
        let userRole = null;

        if (!isCreator && !isCalendarOwner) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId: event.calendar.id, userId },
            });

            if (!participantRole) {
                throw new Error('Not authorized');
            }

            userRole = participantRole.role;
            if (userRole !== ParticipantRole.ADMIN && (userRole !== ParticipantRole.CREATOR || event.creator.id !== userId)) {
                throw new Error('Not authorized to update this event');
            }
        }

        const changedFields: string[] = [];
        if (data.name !== undefined && data.name !== event.name) {
            changedFields.push('name');
        }
        if (data.startDate !== undefined && data.startDate.toString() !== event.startDate.toString()) {
            changedFields.push('startDate');
        }
        if (data.endDate !== undefined && data.endDate.toString() !== event.endDate.toString()) {
            changedFields.push('endDate');
        }
        if (data.description !== undefined && data.description !== event.description) {
            changedFields.push('description');
        }
        if (data.color !== undefined && data.color !== event.color) {
            changedFields.push('color');
        }
        if (data.isCompleted !== undefined && data.isCompleted !== event.isCompleted) {
            changedFields.push('isCompleted');
        }

        if (data.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: data.categoryId, calendar: { id: event.calendar.id } },
            });

            if (!category) {
                throw new Error('Category not found');
            }

            if (category.id !== event.category.id) {
                changedFields.push('categoryId');
            }
            event.category = category;
        }

        Object.assign(event, {
            name: data.name ?? event.name,
            startDate: data.startDate ?? event.startDate,
            endDate: data.endDate ?? event.endDate,
            description: data.description ?? event.description,
            color: data.color ?? event.color,
            isCompleted: data.isCompleted ?? event.isCompleted,
        });

        const updatedEvent = await this.eventRepository.save(event);

        if (changedFields.length > 0) {
            try {
                await this.notificationService.notifyEventUpdated(userId, event.calendar.id, updatedEvent, changedFields);
            } catch (error) {
                console.error('Failed to send event update notifications:', error);
            }
        }

        const refreshedEvent = await this.eventRepository.findOne({
            where: { id: updatedEvent.id },
            relations: ['creator', 'category', 'participants', 'participants.user'],
        });

        if (!refreshedEvent) {
            throw new Error('Failed to retrieve updated event');
        }

        return refreshedEvent;
    }

    async deleteEvent(userId: string, eventId: string): Promise<void> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        const isCreator = event.creator.id === userId;
        const isCalendarOwner = event.calendar.owner.id === userId;

        if (!isCreator && !isCalendarOwner) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId: event.calendar.id, userId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized');
            }
        }

        const calendarId = event.calendar.id;
        const eventName = event.name;

        await this.eventRepository.remove(event);

        try {
            await this.notificationService.notifyEventDeleted(userId, calendarId, eventName);
        } catch (error) {
            console.error('Failed to send event deletion notifications:', error);
        }
    }

    async inviteCalendarParticipantsByEmail(currentUserId: string, eventId: string, data: InviteEventParticipantDto, expireInDays?: number): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator', 'participants', 'participants.user'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        const isCalendarOwner = event.calendar.owner.id === currentUserId;
        const isEventCreator = event.creator.id === currentUserId;

        // Check if user has permission to invite
        if (!isCalendarOwner && !isEventCreator) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId: event.calendar.id, userId: currentUserId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only calendar owner, admin, or event creator can invite users to an event');
            }
        }

        // Get all valid emails (calendar participants and calendar owner)
        const calendarParticipants = await this.calendarParticipantRepository.find({
            where: { calendarId: event.calendar.id },
            relations: ['user'],
        });

        // Get emails of all calendar participants
        let validEmailsSet = new Set(calendarParticipants.filter(cp => cp.user !== null).map(cp => cp.user.email.toLowerCase()));

        // Add calendar owner's email to valid emails
        if (event.calendar.owner && event.calendar.owner.email) {
            validEmailsSet.add(event.calendar.owner.email.toLowerCase());
        }

        // Filter the emails being invited to ensure they're valid
        const validEmails = data.emails.filter(email => validEmailsSet.has(email.toLowerCase()));

        if (validEmails.length === 0) {
            throw new Error('No valid calendar participants or owner to invite');
        }

        // Check which emails are already participants
        const existingParticipants = await this.eventParticipantRepository.find({
            where: { eventId },
            relations: ['user'],
        });

        const existingParticipantEmails = existingParticipants.filter(p => p.user !== null).map(p => p.user.email.toLowerCase());

        const newInviteEmails = validEmails.filter(email => !existingParticipantEmails.includes(email.toLowerCase()));

        if (newInviteEmails.length === 0) {
            throw new Error('All selected users are already participants');
        }

        // Check for existing invites
        let expiresAt: Date | null = null;
        if (expireInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expireInDays);
        }

        const emailInvites: EventEmailInvite[] = [];

        for (const email of newInviteEmails) {
            const existingInvite = await this.eventEmailInviteRepository.findOne({
                where: { eventId, email: email.toLowerCase() },
            });

            if (existingInvite) {
                continue;
            }

            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase() },
            });

            const token = randomBytes(32).toString('hex');

            const emailInvite = this.eventEmailInviteRepository.create({
                event,
                eventId,
                email: email.toLowerCase(),
                userId: user?.id || null,
                token,
                expiresAt,
            });

            emailInvites.push(emailInvite);
            await this.sendEventInviteEmail(email, event, token);
        }

        if (emailInvites.length > 0) {
            await this.eventEmailInviteRepository.save(emailInvites);
        }

        const refreshedEvent = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['creator', 'category', 'participants', 'participants.user'],
        });

        if (!refreshedEvent) {
            throw new Error('Failed to retrieve event data');
        }

        return refreshedEvent;
    }

    private async sendEventInviteEmail(email: string, event: Event, token: string): Promise<void> {
        const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/email-invite/${token}`;

        await this.emailService.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@example.com',
            to: email,
            subject: `You have been invited to event: ${event.name}`,
            html: `
                <h1>Event Invitation</h1>
                <p>You have been invited to the event <strong>${event.name}</strong>.</p>
                <p><strong>Start date:</strong> ${new Date(event.startDate).toLocaleString()}</p>
                <p><strong>End date:</strong> ${new Date(event.endDate).toLocaleString()}</p>
                <p>Click the link below to accept the invitation:</p>
                <p><a href="${inviteUrl}">${inviteUrl}</a></p>
            `,
        });
    }

    async acceptEventEmailInvite(userId: string, token: string): Promise<{ id: string; eventName: string; calendarId: string }> {
        const emailInvite = await this.eventEmailInviteRepository.findOne({
            where: { token },
            relations: ['event', 'event.calendar', 'event.calendar.owner'],
        });

        if (!emailInvite) {
            throw new Error('Invitation not found or invalid');
        }

        if (emailInvite.expiresAt && emailInvite.expiresAt < new Date()) {
            throw new Error('Invitation has expired');
        }

        if (!emailInvite.event) {
            throw new Error('Event associated with this invitation no longer exists');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.email.toLowerCase() !== emailInvite.email.toLowerCase()) {
            throw new Error('This invitation was sent to a different email address');
        }

        // Check if user has access to the calendar (owner or participant)
        const isCalendarOwner = emailInvite.event.calendar.owner.id === userId;

        if (!isCalendarOwner) {
            const isCalendarParticipant = await this.calendarParticipantRepository.findOne({
                where: { calendarId: emailInvite.event.calendar.id, userId },
            });

            if (!isCalendarParticipant) {
                throw new Error('You must be a participant of the calendar to join this event');
            }
        }

        // Handle the participation
        const existingParticipation = await this.eventParticipantRepository.findOne({
            where: { eventId: emailInvite.eventId, userId },
        });

        if (existingParticipation) {
            existingParticipation.hasConfirmed = true;
            await this.eventParticipantRepository.save(existingParticipation);
        } else {
            const participant = this.eventParticipantRepository.create({
                eventId: emailInvite.eventId,
                userId,
                hasConfirmed: true,
            });

            await this.eventParticipantRepository.save(participant);
        }

        await this.eventEmailInviteRepository.remove(emailInvite);

        const event = await this.eventRepository.findOne({
            where: { id: emailInvite.eventId },
            relations: ['calendar'],
        });

        if (!event || !event.calendar) {
            throw new Error('Failed to retrieve event data');
        }

        return {
            id: event.id,
            eventName: event.name,
            calendarId: event.calendar.id,
        };
    }

    /**
     * Get information about an event email invitation
     */
    async getEventEmailInviteInfo(token: string): Promise<{
        eventId: string;
        eventName: string;
        startDate: Date;
        endDate: Date;
        calendarId: string;
        calendarName: string;
        email: string;
    }> {
        const emailInvite = await this.eventEmailInviteRepository.findOne({
            where: { token },
            relations: ['event', 'event.calendar'],
        });

        if (!emailInvite) {
            throw new Error('Invitation not found or invalid');
        }

        if (emailInvite.expiresAt && emailInvite.expiresAt < new Date()) {
            throw new Error('Invitation has expired');
        }

        if (!emailInvite.event) {
            throw new Error('Event associated with this invitation no longer exists');
        }

        return {
            eventId: emailInvite.event.id,
            eventName: emailInvite.event.name,
            startDate: emailInvite.event.startDate,
            endDate: emailInvite.event.endDate,
            calendarId: emailInvite.event.calendar.id,
            calendarName: emailInvite.event.calendar.name,
            email: emailInvite.email,
        };
    }

    /**
     * Get all email invitations for an event
     */
    async getEventEmailInvites(userId: string, eventId: string): Promise<EventEmailInvite[]> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check permission - calendar owner, admin, or event creator can view invites
        const isCalendarOwner = event.calendar.owner.id === userId;
        const isEventCreator = event.creator.id === userId;

        if (!isCalendarOwner && !isEventCreator) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId: event.calendar.id, userId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner, admin, or event creator can view event invitations');
            }
        }

        return this.eventEmailInviteRepository.find({
            where: { eventId },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Delete an event email invitation
     */
    async deleteEventEmailInvite(userId: string, inviteId: string): Promise<void> {
        const emailInvite = await this.eventEmailInviteRepository.findOne({
            where: { id: inviteId },
            relations: ['event', 'event.calendar', 'event.calendar.owner', 'event.creator'],
        });

        if (!emailInvite) {
            throw new Error('Invitation not found');
        }

        // Check permission - now including event creator
        const isCalendarOwner = emailInvite.event.calendar.owner.id === userId;
        const isEventCreator = emailInvite.event.creator.id === userId;

        if (!isCalendarOwner && !isEventCreator) {
            const participantRole = await this.calendarParticipantRepository.findOne({
                where: { calendarId: emailInvite.event.calendar.id, userId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Only the calendar owner, admin, or event creator can cancel invitations');
            }
        }

        await this.eventEmailInviteRepository.remove(emailInvite);
    }

    /**
     * Confirm or decline participation in an event
     */
    async confirmEventParticipation(userId: string, eventId: string, hasConfirmed: boolean): Promise<EventParticipant> {
        const eventParticipant = await this.eventParticipantRepository.findOne({
            where: { eventId, userId },
            relations: ['event', 'user'],
        });

        if (!eventParticipant) {
            throw new Error('You are not invited to this event');
        }

        eventParticipant.hasConfirmed = hasConfirmed;
        return this.eventParticipantRepository.save(eventParticipant);
    }

    /**
     * Remove a participant from an event
     * Only calendar owner or admin can remove participants (or self-removal)
     */
    async removeEventParticipant(currentUserId: string, eventId: string, participantUserId: string): Promise<void> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Self-removal is always allowed
        const isSelfRemoval = currentUserId === participantUserId;

        // Otherwise, check permissions
        if (!isSelfRemoval) {
            const isCalendarOwner = event.calendar.owner.id === currentUserId;
            const isEventCreator = event.creator.id === currentUserId;

            if (!isCalendarOwner && !isEventCreator) {
                const participantRole = await this.calendarParticipantRepository.findOne({
                    where: { calendarId: event.calendar.id, userId: currentUserId },
                });

                if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                    throw new Error('Not authorized to remove participants from this event');
                }
            }
        }

        const eventParticipant = await this.eventParticipantRepository.findOne({
            where: { eventId, userId: participantUserId },
        });

        if (!eventParticipant) {
            throw new Error('Participant not found');
        }

        await this.eventParticipantRepository.remove(eventParticipant);
    }

    /**
     * Get all participants for an event
     */
    async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
        // Fetch event participants
        const participants = await this.eventParticipantRepository.find({
            where: { eventId },
            relations: ['user'],
        });

        // If no participants or all have valid user data, return as is
        if (participants.length === 0 || participants.every(p => p.user !== null)) {
            return participants;
        }

        // For participants with missing user data, fetch users separately
        const missingUserIds = participants.filter(p => p.user === null).map(p => p.userId);

        if (missingUserIds.length > 0) {
            const users = await this.userRepository.findBy({
                id: In(missingUserIds),
            });

            const userMap = new Map(users.map(user => [user.id, user]));

            return participants.map(participant => {
                if (participant.user === null && userMap.has(participant.userId)) {
                    participant.user = userMap.get(participant.userId)!;
                }
                return participant;
            });
        }

        return participants;
    }
}
