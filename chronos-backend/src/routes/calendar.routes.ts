import { FastifyInstance } from 'fastify';
import { authenticateToken } from '@/middlewares/auth.middleware';
import { CalendarController } from '@/controllers';
import { ParticipantRole } from '@/entities';

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

interface CalendarEventsQuery {
    startDate?: string;
    endDate?: string;
}

interface UpdateCalendarBody {
    name?: string;
    description?: string;
    color?: string;
}

interface UpdateParticipantRoleBody {
    role: ParticipantRole;
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

const getCalendarSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getCalendarEventsSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
    querystring: {
        type: 'object',
        properties: {
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
        },
    },
} as const;

const updateCalendarSchema = {
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
            description: { type: 'string', nullable: true },
            color: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
        },
    },
} as const;

const createInviteLinkSchema = {
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
            expireInDays: { type: 'number', minimum: 1, nullable: true },
            role: {
                type: 'string',
                enum: Object.values(ParticipantRole),
                nullable: true,
            },
        },
    },
} as const;

const getInviteLinksSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const acceptInviteSchema = {
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
            role: {
                type: 'string',
                enum: Object.values(ParticipantRole),
                nullable: true,
            },
        },
        // Allow an empty object
        additionalProperties: false,
    },
} as const;

const deleteInviteLinkSchema = {
    params: {
        type: 'object',
        required: ['calendarId', 'linkId'],
        properties: {
            calendarId: { type: 'string', format: 'uuid' },
            linkId: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getInviteLinkInfoSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const getCalendarParticipantsSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const updateParticipantRoleSchema = {
    params: {
        type: 'object',
        required: ['id', 'userId'],
        properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
        },
    },
    body: {
        type: 'object',
        required: ['role'],
        properties: {
            role: {
                type: 'string',
                enum: Object.values(ParticipantRole),
            },
        },
    },
} as const;

const removeParticipantSchema = {
    params: {
        type: 'object',
        required: ['id', 'userId'],
        properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
        },
    },
} as const;

const leaveCalendarSchema = {
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

    // Existing routes
    app.get('/calendars', { preHandler: [authenticateToken] }, calendarController.getUserCalendars.bind(calendarController));

    app.get<{ Params: CalendarParams }>(
        '/calendars/:id',
        { schema: getCalendarSchema, preHandler: [authenticateToken] },
        calendarController.getCalendarById.bind(calendarController),
    );

    app.get<{ Params: CalendarParams; Querystring: CalendarEventsQuery }>(
        '/calendars/:id/events',
        { schema: getCalendarEventsSchema, preHandler: [authenticateToken] },
        calendarController.getCalendarEvents.bind(calendarController),
    );

    app.post<{ Body: CreateCalendarBody }>(
        '/calendars',
        { schema: createCalendarSchema, preHandler: [authenticateToken] },
        calendarController.createCalendar.bind(calendarController),
    );

    app.put<{ Params: CalendarParams; Body: UpdateCalendarBody }>(
        '/calendars/:id',
        { schema: updateCalendarSchema, preHandler: [authenticateToken] },
        calendarController.updateCalendar.bind(calendarController),
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

    app.post<{ Params: { id: string }; Body: { expireInDays?: number; role?: ParticipantRole } }>(
        '/calendars/:id/invite-links',
        { schema: createInviteLinkSchema, preHandler: [authenticateToken] },
        calendarController.createInviteLink.bind(calendarController),
    );

    app.get<{ Params: { id: string } }>(
        '/calendars/:id/invite-links',
        { schema: getInviteLinksSchema, preHandler: [authenticateToken] },
        calendarController.getInviteLinks.bind(calendarController),
    );

    app.post<{ Params: { id: string }; Body: { role?: ParticipantRole } }>(
        '/calendar-invites/:id/accept',
        { schema: acceptInviteSchema, preHandler: [authenticateToken] },
        calendarController.acceptInvite.bind(calendarController),
    );

    app.delete<{ Params: { calendarId: string; linkId: string } }>(
        '/calendars/:calendarId/invite-links/:linkId',
        { schema: deleteInviteLinkSchema, preHandler: [authenticateToken] },
        calendarController.deleteInviteLink.bind(calendarController),
    );

    app.get<{ Params: { id: string } }>(
        '/calendar-invites/:id',
        { schema: getInviteLinkInfoSchema, preHandler: [authenticateToken] },
        calendarController.getInviteLinkInfo.bind(calendarController),
    );

    // New routes for participant role management
    app.get<{ Params: { id: string } }>(
        '/calendars/:id/participants',
        { schema: getCalendarParticipantsSchema, preHandler: [authenticateToken] },
        calendarController.getCalendarParticipants.bind(calendarController),
    );

    app.put<{ Params: { id: string; userId: string }; Body: UpdateParticipantRoleBody }>(
        '/calendars/:id/participants/:userId/role',
        { schema: updateParticipantRoleSchema, preHandler: [authenticateToken] },
        calendarController.updateParticipantRole.bind(calendarController),
    );

    app.delete<{ Params: { id: string; userId: string } }>(
        '/calendars/:id/participants/:userId',
        { schema: removeParticipantSchema, preHandler: [authenticateToken] },
        calendarController.removeParticipant.bind(calendarController),
    );

    app.delete<{ Params: { id: string } }>(
        '/calendars/:id/leave',
        { schema: leaveCalendarSchema, preHandler: [authenticateToken] },
        calendarController.leaveCalendar.bind(calendarController),
    );
}
