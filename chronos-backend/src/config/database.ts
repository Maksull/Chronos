import { Calendar, User, Event, EventReminder, CalendarSettings, EventCategory, CalendarParticipant } from '@/entities';
import { CalendarInviteLink } from '@/entities/CalendarInviteLink';
import { DataSourceOptions } from 'typeorm';

export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '3459',
    database: process.env.DB_NAME || 'chronos',
    entities: [User, Calendar, Event, EventReminder, CalendarSettings, EventCategory, CalendarInviteLink, CalendarParticipant],
    synchronize: process.env.NODE_ENV !== 'production', // Don't use in production!
    logging: process.env.NODE_ENV !== 'production',
};
