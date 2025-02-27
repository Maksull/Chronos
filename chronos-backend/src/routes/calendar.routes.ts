import { FastifyInstance } from 'fastify';
import { CalendarController } from '@/controllers/calendar.controller';
import { authenticateToken } from '@/middlewares/auth.middleware';

interface CreateCalendarBody {
    name: string;
    description?: string;
    color: string;
}

interface ToggleVisibilityBody {
    isVisible: boolean;
}

interface CalendarParams {
    id: string;
}

const createCalendarSchema = {
    body: {
        type: 'object',
        required: ['name', 'color'],
        properties: {
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
        },
    },
} as const;

const toggleVisibilitySchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['isVisible'],
        properties: {
            isVisible: { type: 'boolean' },
        },
    },
} as const;

const deleteCalendarSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

export async function calendarRoutes(app: FastifyInstance) {
    const calendarController = new CalendarController();

    app.get('/calendars', { preHandler: [authenticateToken] }, calendarController.getUserCalendars.bind(calendarController));

    app.post<{ Body: CreateCalendarBody }>(
        '/calendars',
        { schema: createCalendarSchema, preHandler: [authenticateToken] },
        calendarController.createCalendar.bind(calendarController),
    );

    app.put<{ Params: CalendarParams; Body: ToggleVisibilityBody }>(
        '/calendars/:id/visibility',
        { schema: toggleVisibilitySchema, preHandler: [authenticateToken] },
        calendarController.toggleVisibility.bind(calendarController),
    );

    app.delete<{ Params: CalendarParams }>(
        '/calendars/:id',
        { schema: deleteCalendarSchema, preHandler: [authenticateToken] },
        calendarController.deleteCalendar.bind(calendarController),
    );
}
