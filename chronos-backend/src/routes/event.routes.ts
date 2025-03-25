import { FastifyInstance } from 'fastify';
import { authenticateToken } from '@/middlewares/auth.middleware';
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
    categoryId: string;
    startDate: string;
    endDate: string;
    description?: string;
    color?: string;
}

interface UpdateEventBody {
    name?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    color?: string;
    isCompleted?: boolean;
}

interface InviteEventParticipantBody {
    emails: string[];
    expireInDays?: number;
}

interface EventParticipationBody {
    hasConfirmed: boolean;
}

interface EventParticipantParams {
    eventId: string;
    userId: string;
}

interface TokenParams {
    token: string;
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
        required: ['name', 'categoryId', 'startDate', 'endDate'],
        properties: {
            name: { type: 'string' },
            categoryId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$', nullable: true },
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
            categoryId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$', nullable: true },
            isCompleted: { type: 'boolean' },
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
            categoryId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$', nullable: true },
            isCompleted: { type: 'boolean' },
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

const inviteEventParticipantByEmailSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['emails'],
        properties: {
            emails: {
                type: 'array',
                items: { type: 'string', format: 'email' },
                minItems: 1,
            },
            expireInDays: { type: 'number', nullable: true },
        },
    },
} as const;

const confirmEventParticipationSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['hasConfirmed'],
        properties: {
            hasConfirmed: { type: 'boolean' },
        },
    },
} as const;

const removeEventParticipantSchema = {
    params: {
        type: 'object',
        required: ['eventId', 'userId'],
        properties: {
            eventId: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getEventParticipantsSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const acceptEventEmailInviteSchema = {
    params: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        },
    },
} as const;

const getEventEmailInviteInfoSchema = {
    params: {
        type: 'object',
        required: ['token'],
        properties: {
            token: { type: 'string' },
        },
    },
} as const;

const getEventEmailInvitesSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const deleteEventEmailInviteSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

export async function eventRoutes(app: FastifyInstance) {
    const eventController = new EventController();

    // Create event
    app.post<{ Params: CalendarParams; Body: CreateEventBody }>(
        '/calendars/:calendarId/events',
        {
            schema: createEventSchema,
            preHandler: [authenticateToken],
        },
        eventController.createEvent.bind(eventController),
    );

    // Update event
    app.put<{ Params: EventParams; Body: UpdateEventBody }>(
        '/events/:id',
        {
            schema: updateEventSchema,
            preHandler: [authenticateToken],
        },
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

    // Delete event
    app.delete<{ Params: EventParams }>(
        '/events/:id',
        {
            schema: deleteEventSchema,
            preHandler: [authenticateToken],
        },
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

    // Email invitation endpoints
    app.post<{ Params: EventParams; Body: InviteEventParticipantBody }>(
        '/events/:id/email-invites',
        {
            schema: inviteEventParticipantByEmailSchema,
            preHandler: [authenticateToken],
        },
        eventController.inviteCalendarParticipantsByEmail.bind(eventController),
    );

    app.get<{ Params: EventParams }>(
        '/events/:id/email-invites',
        {
            schema: getEventEmailInvitesSchema,
            preHandler: [authenticateToken],
        },
        eventController.getEventEmailInvites.bind(eventController),
    );

    app.delete<{ Params: EventParams }>(
        '/events/email-invites/:id',
        {
            schema: deleteEventEmailInviteSchema,
            preHandler: [authenticateToken],
        },
        eventController.deleteEventEmailInvite.bind(eventController),
    );

    app.get<{ Params: TokenParams }>(
        '/events/email-invite/:token/info',
        {
            schema: getEventEmailInviteInfoSchema,
        },
        eventController.getEventEmailInviteInfo.bind(eventController),
    );

    app.post<{ Params: TokenParams }>(
        '/events/email-invite/:token/accept',
        {
            schema: acceptEventEmailInviteSchema,
            preHandler: [authenticateToken],
        },
        eventController.acceptEventEmailInvite.bind(eventController),
    );

    // Event participants endpoints
    app.put<{ Params: EventParams; Body: EventParticipationBody }>(
        '/events/:id/participation',
        {
            schema: confirmEventParticipationSchema,
            preHandler: [authenticateToken],
        },
        eventController.confirmEventParticipation.bind(eventController),
    );

    app.delete<{ Params: EventParticipantParams }>(
        '/events/:eventId/participants/:userId',
        {
            schema: removeEventParticipantSchema,
            preHandler: [authenticateToken],
        },
        eventController.removeEventParticipant.bind(eventController),
    );

    app.get<{ Params: EventParams }>(
        '/events/:id/participants',
        {
            schema: getEventParticipantsSchema,
            preHandler: [authenticateToken],
        },
        eventController.getEventParticipants.bind(eventController),
    );
}
