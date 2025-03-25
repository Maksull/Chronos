import { FastifyRequest, FastifyReply } from 'fastify';
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
                categoryId: string;
                startDate: string;
                endDate: string;
                description?: string;
                color?: string;
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

            return reply.status(201).send({
                status: 'success',
                data: event,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found' || error.message === 'User not found' || error.message === 'Category not found') {
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

    async updateEvent(
        request: FastifyRequest<{
            Params: { id?: string; calendarId?: string };
            Body: {
                name?: string;
                categoryId?: string;
                startDate?: string;
                endDate?: string;
                description?: string;
                color?: string;
                isCompleted?: boolean;
            };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const eventId = request.params.id;
            if (!eventId) {
                return reply.status(400).send({
                    status: 'error',
                    message: 'Event ID is required',
                });
            }

            const updateData: UpdateEventDto = {};
            if (request.body.name !== undefined) updateData.name = request.body.name;
            if (request.body.categoryId !== undefined) updateData.categoryId = request.body.categoryId;
            if (request.body.description !== undefined) updateData.description = request.body.description;
            if (request.body.color !== undefined) updateData.color = request.body.color;
            if (request.body.isCompleted !== undefined) updateData.isCompleted = request.body.isCompleted;

            if (request.body.startDate) {
                updateData.startDate = new Date(request.body.startDate);
            }

            if (request.body.endDate) {
                updateData.endDate = new Date(request.body.endDate);
            }

            const event = await this.eventService.updateEvent(request.user!.userId, eventId, updateData);

            return reply.send({
                status: 'success',
                data: event,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found' || error.message === 'Category not found') {
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

    async deleteEvent(
        request: FastifyRequest<{
            Params: { id?: string; calendarId?: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const eventId = request.params.id;
            if (!eventId) {
                return reply.status(400).send({
                    status: 'error',
                    message: 'Event ID is required',
                });
            }

            await this.eventService.deleteEvent(request.user!.userId, eventId);

            return reply.send({
                status: 'success',
                message: 'Event deleted successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found') {
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

    /**
     * Invite calendar participants to an event by email
     */
    async inviteCalendarParticipantsByEmail(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { emails: string[]; expireInDays?: number };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id: eventId } = request.params;
            const { emails, expireInDays } = request.body;

            const event = await this.eventService.inviteCalendarParticipantsByEmail(request.user!.userId, eventId, { emails }, expireInDays);

            return reply.status(200).send({
                status: 'success',
                data: event,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Event not found' ||
                    error.message === 'No valid calendar participants to invite' ||
                    error.message === 'All selected users are already participants'
                ) {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }

                if (error.message === 'Only calendar owner or admin can invite users to an event' || error.message === 'Not authorized') {
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

    /**
     * Accept event email invitation
     */
    async acceptEventEmailInvite(
        request: FastifyRequest<{
            Params: { token: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { token } = request.params;

            const event = await this.eventService.acceptEventEmailInvite(request.user!.userId, token);

            return reply.status(200).send({
                status: 'success',
                data: event,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Invitation not found or invalid' ||
                    error.message === 'Invitation has expired' ||
                    error.message === 'Event associated with this invitation no longer exists' ||
                    error.message === 'User not found' ||
                    error.message === 'This invitation was sent to a different email address' ||
                    error.message === 'You must be a participant of the calendar to join this event'
                ) {
                    return reply.status(404).send({
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

    /**
     * Get information about an event email invitation
     */
    async getEventEmailInviteInfo(
        request: FastifyRequest<{
            Params: { token: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { token } = request.params;

            const inviteInfo = await this.eventService.getEventEmailInviteInfo(token);

            return reply.status(200).send({
                status: 'success',
                data: inviteInfo,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Invitation not found or invalid' ||
                    error.message === 'Invitation has expired' ||
                    error.message === 'Event associated with this invitation no longer exists'
                ) {
                    return reply.status(404).send({
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

    /**
     * Get all email invitations for an event
     */
    async getEventEmailInvites(
        request: FastifyRequest<{
            Params: { id: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id: eventId } = request.params;

            const invites = await this.eventService.getEventEmailInvites(request.user!.userId, eventId);

            return reply.status(200).send({
                status: 'success',
                data: invites,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }

                if (error.message === 'Only the calendar owner or admin can view event invitations') {
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

    /**
     * Delete an event email invitation
     */
    async deleteEventEmailInvite(
        request: FastifyRequest<{
            Params: { id: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id: inviteId } = request.params;

            await this.eventService.deleteEventEmailInvite(request.user!.userId, inviteId);

            return reply.status(200).send({
                status: 'success',
                message: 'Event invitation deleted successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invitation not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }

                if (error.message === 'Only the calendar owner or admin can cancel invitations') {
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

    /**
     * Confirm event participation
     */
    async confirmEventParticipation(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { hasConfirmed: boolean };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id: eventId } = request.params;
            const { hasConfirmed } = request.body;

            const participation = await this.eventService.confirmEventParticipation(request.user!.userId, eventId, hasConfirmed);

            return reply.status(200).send({
                status: 'success',
                data: participation,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'You are not invited to this event') {
                    return reply.status(404).send({
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

    /**
     * Remove a participant from an event
     */
    async removeEventParticipant(
        request: FastifyRequest<{
            Params: { eventId: string; userId: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { eventId, userId } = request.params;

            await this.eventService.removeEventParticipant(request.user!.userId, eventId, userId);

            return reply.status(200).send({
                status: 'success',
                message: 'Participant removed successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found' || error.message === 'Participant not found') {
                    return reply.status(404).send({
                        status: 'error',
                        message: error.message,
                    });
                }

                if (error.message === 'Not authorized to remove participants from this event') {
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

    /**
     * Get all participants for an event
     */
    async getEventParticipants(
        request: FastifyRequest<{
            Params: { id: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id: eventId } = request.params;

            const participants = await this.eventService.getEventParticipants(eventId);

            return reply.status(200).send({
                status: 'success',
                data: participants,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Event not found') {
                    return reply.status(404).send({
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
}
