import { AppDataSource } from '@/database/data-source';
import { EventCategory, Calendar, CalendarParticipant } from '@/entities';

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(EventCategory);
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private participantRepository = AppDataSource.getRepository(CalendarParticipant);

    async getCategoriesByCalendarId(userId: string, calendarId: string): Promise<EventCategory[]> {
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

        return this.categoryRepository.find({
            where: { calendar: { id: calendarId } },
            order: { name: 'ASC' },
        });
    }

    async createCategory(userId: string, calendarId: string, data: { name: string; color?: string }): Promise<EventCategory> {
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

        const category = this.categoryRepository.create({
            name: data.name,
            color: data.color || '#CCCCCC',
            calendar,
        });

        return this.categoryRepository.save(category);
    }

    async updateCategory(userId: string, categoryId: string, data: { name?: string; color?: string }): Promise<EventCategory> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!category) {
            throw new Error('Category not found');
        }

        const isOwner = category.calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId: category.calendar.id, userId },
            });
            if (!participantRole) {
                throw new Error('Not authorized');
            }
        }

        if (data.name !== undefined) category.name = data.name;
        if (data.color !== undefined) category.color = data.color;

        return this.categoryRepository.save(category);
    }

    async deleteCategory(userId: string, categoryId: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!category) {
            throw new Error('Category not found');
        }

        const isOwner = category.calendar.owner.id === userId;
        if (!isOwner) {
            const participantRole = await this.participantRepository.findOne({
                where: { calendarId: category.calendar.id, userId },
            });
            if (!participantRole) {
                throw new Error('Not authorized');
            }
        }

        await this.categoryRepository.remove(category);
    }

    async getCategoryById(userId: string, categoryId: string): Promise<EventCategory> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['calendar', 'calendar.owner', 'calendar.participantRoles'],
        });

        if (!category) {
            throw new Error('Category not found');
        }

        const isOwner = category.calendar.owner.id === userId;
        const isParticipant = category.calendar.participantRoles?.some((participant: CalendarParticipant) => participant.userId === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
        }

        return category;
    }
}
