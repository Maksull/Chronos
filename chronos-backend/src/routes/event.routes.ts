import { FastifyInstance } from 'fastify';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { EventCategory } from '@/entities';
import { EventController } from '@/controllers';

interface EventParams {
    id: string;
}

interface CalendarEventParams {
    calendarId: string;
    id: string;
}

interface CalendarParams {
    calendarId: string;
}

interface CreateEventBody {
    name: string;
    category: EventCategory;
    startDate: string;
    endDate: string;
    description?: string;
    color?: string;
    invitees?: string[];
}

interface UpdateEventBody {
    name?: string;
    category?: EventCategory;
    startDate?: string;
    endDate?: string;
    description?: string;
    color?: string;
    isCompleted?: boolean;
    invitees?: string[];
}

const createEventSchema = {
    params: {
        type: 'object',
        required: ['calendarId'],
        properties: {
            calendarId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['name', 'category', 'startDate', 'endDate'],
        properties: {
            name: { type: 'string' },
            category: {
                type: 'string',
                enum: ['ARRANGEMENT', 'REMINDER', 'TASK'],
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            color: {
                type: 'string',
                pattern: '^#[0-9a-fA-F]{6}$',
                nullable: true,
            },
            invitees: {
                type: 'array',
                items: { type: 'string', format: 'uuid' },
                nullable: true,
            },
        },
    },
} as const;

const updateEventSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            category: {
                type: 'string',
                enum: ['ARRANGEMENT', 'REMINDER', 'TASK'],
            },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            color: {
                type: 'string',
                pattern: '^#[0-9a-fA-F]{6}$',
                nullable: true,
            },
            isCompleted: { type: 'boolean' },
            invitees: {
                type: 'array',
                items: { type: 'string', format: 'uuid' },
                nullable: true,
            },
        },
    },
} as const;

const deleteEventSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const updateCalendarEventSchema = {
    params: {
        type: 'object',
        required: ['calendarId', 'id'],
        properties: {
            calendarId: { type: 'string', format: 'uuid' },
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            category: { type: 'string', enum: ['ARRANGEMENT', 'REMINDER', 'TASK'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$', nullable: true },
            isCompleted: { type: 'boolean' },
            invitees: {
                type: 'array',
                items: { type: 'string', format: 'uuid' },
                nullable: true,
            },
        },
    },
} as const;

const deleteCalendarEventSchema = {
    params: {
        type: 'object',
        required: ['calendarId', 'id'],
        properties: {
            calendarId: { type: 'string', format: 'uuid' },
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

export async function eventRoutes(app: FastifyInstance) {
    const eventController = new EventController();

    // Create a new event for a calendar
    app.post<{ Params: CalendarParams; Body: CreateEventBody }>(
        '/calendars/:calendarId/events',
        { schema: createEventSchema, preHandler: [authenticateToken] },
        eventController.createEvent.bind(eventController),
    );

    // Update an event
    app.put<{ Params: EventParams; Body: UpdateEventBody }>(
        '/events/:id',
        { schema: updateEventSchema, preHandler: [authenticateToken] },
        eventController.updateEvent.bind(eventController),
    );

    app.put<{ Params: CalendarEventParams; Body: UpdateEventBody }>(
        '/calendars/:calendarId/events/:id',
        {
            schema: updateCalendarEventSchema,
            preHandler: [authenticateToken],
        },
        eventController.updateEvent.bind(eventController),
    );

    // Delete an event
    app.delete<{ Params: EventParams }>(
        '/events/:id',
        { schema: deleteEventSchema, preHandler: [authenticateToken] },
        eventController.deleteEvent.bind(eventController),
    );

    app.delete<{ Params: CalendarEventParams }>(
        '/calendars/:calendarId/events/:id',
        {
            schema: deleteCalendarEventSchema,
            preHandler: [authenticateToken],
        },
        eventController.deleteEvent.bind(eventController),
    );
}
