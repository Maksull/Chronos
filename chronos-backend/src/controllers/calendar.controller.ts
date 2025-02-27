import { FastifyRequest, FastifyReply } from 'fastify';
import { CalendarService } from '@/services/calendar.service';

export class CalendarController {
    private calendarService: CalendarService;

    constructor() {
        this.calendarService = new CalendarService();
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
}
