import { AppDataSource } from '@/database/data-source';
import { EventCategory, Calendar } from '@/entities';

export interface CreateCategoryDto {
    name: string;
    description?: string;
    color?: string;
}

export interface UpdateCategoryDto {
    name?: string;
    description?: string;
    color?: string;
}

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(EventCategory);
    private calendarRepository = AppDataSource.getRepository(Calendar);

    async getCategoriesByCalendarId(userId: string, calendarId: string): Promise<EventCategory[]> {
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

        return this.categoryRepository.find({
            where: { calendar: { id: calendarId } },
            order: { name: 'ASC' },
        });
    }

    async createCategory(userId: string, calendarId: string, data: CreateCategoryDto): Promise<EventCategory> {
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

        const category = this.categoryRepository.create({
            ...data,
            calendar,
        });

        return this.categoryRepository.save(category);
    }

    async updateCategory(userId: string, categoryId: string, data: UpdateCategoryDto): Promise<EventCategory> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!category) {
            throw new Error('Category not found');
        }

        if (category.calendar.owner.id !== userId) {
            throw new Error('Not authorized');
        }

        Object.assign(category, {
            name: data.name ?? category.name,
            description: data.description ?? category.description,
            color: data.color ?? category.color,
        });

        return this.categoryRepository.save(category);
    }

    async deleteCategory(userId: string, categoryId: string): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['calendar', 'calendar.owner', 'events'],
        });

        if (!category) {
            throw new Error('Category not found');
        }

        if (category.calendar.owner.id !== userId) {
            throw new Error('Not authorized');
        }

        if (category.events && category.events.length > 0) {
            throw new Error('Cannot delete category with associated events');
        }

        await this.categoryRepository.remove(category);
    }

    async getCategoryById(userId: string, categoryId: string): Promise<EventCategory> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['calendar', 'calendar.owner', 'calendar.participants'],
        });

        if (!category) {
            throw new Error('Category not found');
        }

        const isOwner = category.calendar.owner.id === userId;
        const isParticipant = category.calendar.participants?.some(participant => participant.id === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
        }

        return category;
    }
}
