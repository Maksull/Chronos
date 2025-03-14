import { AppDataSource } from '@/database/data-source';
import { Event, EventCategory, Calendar, User } from '@/entities';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

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

    async getEventsByCalendarId(userId: string, calendarId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner', 'participants'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;
        const isParticipant = calendar.participants?.some(participant => participant.id === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
        }

        const conditions: any = {
            calendar: { id: calendarId },
        };

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
            relations: ['owner', 'participants'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;
        const isParticipant = calendar.participants?.some(participant => participant.id === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
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

        return this.eventRepository.save(event);
    }

    async updateEvent(userId: string, eventId: string, data: UpdateEventDto): Promise<Event> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['calendar', 'calendar.owner', 'creator', 'invitees', 'category'],
        });

        if (!event) {
            throw new Error('Event not found');
        }

        const isCreator = event.creator.id === userId;
        const isCalendarOwner = event.calendar.owner.id === userId;

        if (!isCreator && !isCalendarOwner) {
            throw new Error('Not authorized');
        }

        if (data.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: data.categoryId, calendar: { id: event.calendar.id } },
            });

            if (!category) {
                throw new Error('Category not found');
            }

            event.category = category;
        }

        if (data.invitees) {
            const invitees = await this.userRepository.findBy({ id: { $in: data.invitees } as any });
            event.invitees = invitees;
        }

        Object.assign(event, {
            name: data.name ?? event.name,
            startDate: data.startDate ?? event.startDate,
            endDate: data.endDate ?? event.endDate,
            description: data.description ?? event.description,
            color: data.color ?? event.color,
            isCompleted: data.isCompleted ?? event.isCompleted,
        });

        return this.eventRepository.save(event);
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
            throw new Error('Not authorized');
        }

        await this.eventRepository.remove(event);
    }
}
