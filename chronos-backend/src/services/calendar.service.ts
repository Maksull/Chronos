import { AppDataSource } from '@/database/data-source';
import { Calendar, User } from '@/entities';

interface CreateCalendarDto {
    name: string;
    description?: string;
    color: string;
}

export class CalendarService {
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private userRepository = AppDataSource.getRepository(User);

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

        return this.calendarRepository.save(calendar);
    }

    async getUserCalendars(userId: string): Promise<Calendar[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['ownedCalendars', 'sharedCalendars'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        const ownedCalendars = user.ownedCalendars || [];
        const sharedCalendars = user.sharedCalendars || [];

        return [...ownedCalendars, ...sharedCalendars];
    }

    async toggleCalendarVisibility(userId: string, calendarId: string, isVisible: boolean): Promise<Calendar> {
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

        if (calendar.isMain) {
            throw new Error('Cannot modify main calendar visibility');
        }

        calendar.isVisible = isVisible;
        return this.calendarRepository.save(calendar);
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
}
