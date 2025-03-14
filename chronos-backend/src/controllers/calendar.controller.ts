import { CalendarService, EventService } from '@/services';
import { FastifyRequest, FastifyReply } from 'fastify';

export class CalendarController {
    private calendarService: CalendarService;
    private eventService: EventService;

    constructor() {
        this.calendarService = new CalendarService();
        this.eventService = new EventService();
    }

    async createCalendar(request: FastifyRequest<{ Body: { name: string; description?: string; color: string } }>, reply: FastifyReply) {
        try {
            const calendar = await this.calendarService.createCalendar(request.user!.userId, request.body);
            return reply.status(201).send({ status: 'success', data: calendar });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async updateCalendar(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { name?: string; description?: string; color?: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const updateData = request.body;

            const calendar = await this.calendarService.updateCalendar(request.user!.userId, id, updateData);

            return reply.send({
                status: 'success',
                data: calendar,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({
                        status: 'error',
                        message: error.message,
                    });
                }
            }
            request.log.error(error);
            return reply.status(500).send({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    async getUserCalendars(request: FastifyRequest, reply: FastifyReply) {
        try {
            const calendars = await this.calendarService.getUserCalendars(request.user!.userId);
            return reply.send({ status: 'success', data: calendars });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getCalendarById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const calendar = await this.calendarService.getCalendarById(request.user!.userId, request.params.id);
            return reply.send({ status: 'success', data: calendar });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getCalendarEvents(
        request: FastifyRequest<{
            Params: { id: string };
            Querystring: { startDate?: string; endDate?: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { startDate, endDate } = request.query;
            const events = await this.eventService.getEventsByCalendarId(
                request.user!.userId,
                request.params.id,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined,
            );
            return reply.send({ status: 'success', data: events });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async toggleVisibility(request: FastifyRequest<{ Params: { id: string }; Body: { isVisible: boolean } }>, reply: FastifyReply) {
        try {
            const calendar = await this.calendarService.toggleCalendarVisibility(request.user!.userId, request.params.id, request.body.isVisible);
            return reply.send({ status: 'success', data: calendar });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized' || error.message === 'Cannot modify main calendar visibility') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async deleteCalendar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            await this.calendarService.deleteCalendar(request.user!.userId, request.params.id);
            return reply.send({ status: 'success', message: 'Calendar deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized' || error.message === 'Cannot delete main or holiday calendar') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async createInviteLink(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { expireInDays?: number };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const { expireInDays } = request.body;

            const inviteLink = await this.calendarService.createInviteLink(request.user!.userId, id, expireInDays);

            // Format for frontend to create a shareable URL
            const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/invite/${inviteLink.id}`;

            return reply.status(201).send({
                status: 'success',
                data: {
                    ...inviteLink,
                    inviteUrl,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner can create invite links') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getInviteLinks(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const inviteLinks = await this.calendarService.getCalendarInviteLinks(request.user!.userId, id);

            // Format for frontend to create shareable URLs
            const formattedLinks = inviteLinks.map(link => ({
                ...link,
                inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/invite/${link.id}`,
            }));

            return reply.send({
                status: 'success',
                data: formattedLinks,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner can view invite links') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async acceptInvite(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params; // This is the invite link ID

            const calendar = await this.calendarService.acceptInvite(request.user!.userId, id);

            return reply.send({
                status: 'success',
                message: `You've been added to "${calendar.name}" calendar`,
                data: calendar,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invite link not found or invalid') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Invite link has expired') {
                    return reply.status(410).send({ status: 'error', message: error.message });
                }
                if (error.message === 'User not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'You are already the owner of this calendar' || error.message === 'You are already a participant in this calendar') {
                    return reply.status(409).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async deleteInviteLink(request: FastifyRequest<{ Params: { calendarId: string; linkId: string } }>, reply: FastifyReply) {
        try {
            const { linkId } = request.params;

            await this.calendarService.deleteInviteLink(request.user!.userId, linkId);

            return reply.send({
                status: 'success',
                message: 'Invite link deleted successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invite link not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner can delete invite links') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getInviteLinkInfo(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            const calendarInfo = await this.calendarService.getInviteLinkInfo(id);

            return reply.send({
                status: 'success',
                data: calendarInfo,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Invite link not found or invalid' ||
                    error.message === 'Invite link has expired' ||
                    error.message === 'Calendar associated with this invite link was not found'
                ) {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }
}
