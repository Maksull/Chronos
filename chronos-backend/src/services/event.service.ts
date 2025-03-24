import { AppDataSource } from '@/database/data-source';
import { Event, EventCategory, Calendar, User, CalendarParticipant, ParticipantRole } from '@/entities';
import { In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { NotificationService } from '.';

export interface CreateEventDto {
    name: string;
    categoryId: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    color?: string;
    invitees?: string[];
}

export interface UpdateEventDto {
    name?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    color?: string;
    isCompleted?: boolean;
    invitees?: string[];
}

export class EventService {
    private eventRepository = AppDataSource.getRepository(Event);
    private categoryRepository = AppDataSource.getRepository(EventCategory);
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private userRepository = AppDataSource.getRepository(User);
    private participantRepository = AppDataSource.getRepository(CalendarParticipant);
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
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
            const participantRole = await this.participantRepository.findOne({
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
            // Use In operator to filter events with any of the selected category IDs
            conditions.category = { id: In(categoryIds) };
        }

        // Handle date conditions
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
            relations: ['creator', 'invitees', 'category'],
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

        // If not owner, check if they're a participant with appropriate permissions
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId, userId },
            });

            // Only ADMIN and CREATOR roles can create events
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

        let invitees: User[] = [];
        if (data.invitees && data.invitees.length > 0) {
            invitees = await this.userRepository.findBy({ id: { $in: data.invitees } as any });
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
            invitees,
            isCompleted: false,
        });

        const savedEvent = await this.eventRepository.save(event);

        // Send notifications to all calendar participants
        try {
            await this.notificationService.notifyEventCreated(userId, calendarId, savedEvent);
        } catch (error) {
            console.error('Failed to send event creation notifications:', error);
            // Continue with the function as the event was successfully created
        }

        return savedEvent;
    }

    async updateEvent(userId: string, eventId: string, data: UpdateEventDto): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator', 'invitees', 'category'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check permissions:
        // 1. Creator of the event can update it
        const isCreator = event.creator.id === userId;
        // 2. Calendar owner can update any event
        const isCalendarOwner = event.calendar.owner.id === userId;
        let userRole = null;

        if (!isCreator && !isCalendarOwner) {
            const participantRole = await this.participantRepository.findOne({
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

        // Track changed fields for notifications
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

        if (data.invitees) {
            const invitees = await this.userRepository.findBy({ id: { $in: data.invitees } as any });

            // Check if invitees list has changed
            const oldInviteeIds = event.invitees
                .map(inv => inv.id)
                .sort()
                .join(',');
            const newInviteeIds = invitees
                .map(inv => inv.id)
                .sort()
                .join(',');

            if (oldInviteeIds !== newInviteeIds) {
                changedFields.push('invitees');
            }

            event.invitees = invitees;
        }

        // Update other fields
        Object.assign(event, {
            name: data.name ?? event.name,
            startDate: data.startDate ?? event.startDate,
            endDate: data.endDate ?? event.endDate,
            description: data.description ?? event.description,
            color: data.color ?? event.color,
            isCompleted: data.isCompleted ?? event.isCompleted,
        });

        const updatedEvent = await this.eventRepository.save(event);

        // Only send notifications if fields actually changed
        if (changedFields.length > 0) {
            try {
                await this.notificationService.notifyEventUpdated(userId, event.calendar.id, updatedEvent, changedFields);
            } catch (error) {
                console.error('Failed to send event update notifications:', error);
                // Continue with the function as the event was successfully updated
            }
        }

        return updatedEvent;
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
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId: event.calendar.id, userId },
            });

            if (!participantRole || participantRole.role !== ParticipantRole.ADMIN) {
                throw new Error('Not authorized');
            }
        }

        const calendarId = event.calendar.id;
        const eventName = event.name;

        await this.eventRepository.remove(event);

        // Send notification about event deletion
        try {
            await this.notificationService.notifyEventDeleted(userId, calendarId, eventName);
        } catch (error) {
            console.error('Failed to send event deletion notifications:', error);
            // Continue with the function as the event was successfully deleted
        }
    }
}
