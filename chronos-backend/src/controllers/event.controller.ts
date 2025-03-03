import { FastifyRequest, FastifyReply } from 'fastify';
import { EventCategory } from '@/entities';
import { EventService } from '@/services';
import { UpdateEventDto } from '@/services/event.service';

export class EventController {
    private eventService: EventService;

    constructor() {
        this.eventService = new EventService();
    }

    async createEvent(
        request: FastifyRequest<{
            Params: { calendarId: string };
            Body: {
                name: string;
                category: EventCategory;
                startDate: string;
                endDate: string;
                description?: string;
                color?: string;
                invitees?: string[];
            };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { calendarId } = request.params;
            const eventData = {
                ...request.body,
                startDate: new Date(request.body.startDate),
                endDate: new Date(request.body.endDate),
            };

            const event = await this.eventService.createEvent(request.user!.userId, calendarId, eventData);

            return reply.status(201).send({ status: 'success', data: event });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found' || error.message === 'User not found') {
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

    async updateEvent(
        request: FastifyRequest<{
            Params: { id: string };
            Body: {
                name?: string;
                category?: EventCategory;
                startDate?: string;
                endDate?: string;
                description?: string;
                color?: string;
                isCompleted?: boolean;
                invitees?: string[];
            };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;

            // Create a new object with the proper types for UpdateEventDto
            const updateData: UpdateEventDto = {};

            // Copy basic properties
            if (request.body.name !== undefined) updateData.name = request.body.name;
            if (request.body.category !== undefined) updateData.category = request.body.category;
            if (request.body.description !== undefined) updateData.description = request.body.description;
            if (request.body.color !== undefined) updateData.color = request.body.color;
            if (request.body.isCompleted !== undefined) updateData.isCompleted = request.body.isCompleted;
            if (request.body.invitees !== undefined) updateData.invitees = request.body.invitees;

            // Convert dates
            if (request.body.startDate) {
                updateData.startDate = new Date(request.body.startDate);
            }

            if (request.body.endDate) {
                updateData.endDate = new Date(request.body.endDate);
            }

            const event = await this.eventService.updateEvent(request.user!.userId, id, updateData);

            return reply.send({ status: 'success', data: event });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found') {
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

    async deleteEvent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            await this.eventService.deleteEvent(request.user!.userId, id);
            return reply.send({ status: 'success', message: 'Event deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found') {
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
}
