import { AppDataSource } from '@/database/data-source';
import { Event, EventCategory, Calendar, User } from '@/entities';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

export interface CreateEventDto {
    name: string;
    category: EventCategory;
    startDate: Date;
    endDate: Date;
    description?: string;
    color?: string;
    invitees?: string[]; // Array of user IDs
}

export interface UpdateEventDto {
    name?: string;
    category?: EventCategory;
    startDate?: Date;
    endDate?: Date;
    description?: string;
    color?: string;
    isCompleted?: boolean;
    invitees?: string[]; // Array of user IDs
}

export class EventService {
    private eventRepository = AppDataSource.getRepository(Event);
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private userRepository = AppDataSource.getRepository(User);

    async getEventsByCalendarId(userId: string, calendarId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
        // First check if user has access to this calendar
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner', 'participants'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Check if user is owner or participant
        const isOwner = calendar.owner.id === userId;
        const isParticipant = calendar.participants?.some(participant => participant.id === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
        }

        // Build query conditions
        const conditions: any = { calendar: { id: calendarId } };

        // Add date range conditions if provided
        if (startDate && endDate) {
            // Events that overlap with the given date range
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
            relations: ['creator', 'invitees'],
        });
    }

    async createEvent(userId: string, calendarId: string, data: CreateEventDto): Promise<Event> {
        // Check if calendar exists and user can access it
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner', 'participants'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Check if user is owner or participant with write access
        const isOwner = calendar.owner.id === userId;
        const isParticipant = calendar.participants?.some(participant => participant.id === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
        }

        // Find user for creator reference
        const creator = await this.userRepository.findOneBy({ id: userId });
        if (!creator) {
            throw new Error('User not found');
        }

        // Find invitees if provided
        let invitees: User[] = [];
        if (data.invitees && data.invitees.length > 0) {
            invitees = await this.userRepository.findBy({ id: { $in: data.invitees } as any });
        }

        // Create event
        const event = this.eventRepository.create({
            ...data,
            calendar,
            creator,
            invitees,
            isCompleted: false,
        });

        return this.eventRepository.save(event);
    }

    async updateEvent(userId: string, eventId: string, data: UpdateEventDto): Promise<Event> {
        // Find event with relations
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'creator', 'invitees'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check if user is creator or calendar owner
        const isCreator = event.creator.id === userId;
        const isCalendarOwner = event.calendar.owner.id === userId;

        if (!isCreator && !isCalendarOwner) {
            throw new Error('Not authorized');
        }

        // Update invitees if provided
        if (data.invitees) {
            const invitees = await this.userRepository.findBy({ id: { $in: data.invitees } as any });
            event.invitees = invitees;
        }

        // Update other fields
        Object.assign(event, {
            name: data.name ?? event.name,
            category: data.category ?? event.category,
            startDate: data.startDate ?? event.startDate,
            endDate: data.endDate ?? event.endDate,
            description: data.description ?? event.description,
            color: data.color ?? event.color,
            isCompleted: data.isCompleted ?? event.isCompleted,
        });

        return this.eventRepository.save(event);
    }

    async deleteEvent(userId: string, eventId: string): Promise<void> {
        // Find event with relations
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'creator'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Check if user is creator or calendar owner
        const isCreator = event.creator.id === userId;
        const isCalendarOwner = event.calendar.owner.id === userId;

        if (!isCreator && !isCalendarOwner) {
            throw new Error('Not authorized');
        }

        await this.eventRepository.remove(event);
    }
}
