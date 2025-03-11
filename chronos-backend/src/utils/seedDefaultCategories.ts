import { AppDataSource } from '@/database/data-source';
import { Calendar, EventCategory } from '@/entities';

export async function seedDefaultCategories(calendarId: string): Promise<void> {
    const categoryRepository = AppDataSource.getRepository(EventCategory);
    const calendarRepository = AppDataSource.getRepository(Calendar);

    const calendar = await calendarRepository.findOneBy({ id: calendarId });

    if (!calendar) {
        throw new Error('Calendar not found');
    }

    // Define default categories
    const defaultCategories = [
        {
            name: 'Arrangement',
            description: 'For appointments and meetings',
            color: '#4285F4', // Google Blue
            calendar,
        },
        {
            name: 'Reminder',
            description: 'For reminders and alerts',
            color: '#EA4335', // Google Red
            calendar,
        },
        {
            name: 'Task',
            description: 'For to-dos and tasks',
            color: '#FBBC05', // Google Yellow
            calendar,
        },
    ];

    // Create and save default categories
    for (const categoryData of defaultCategories) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
    }
}
