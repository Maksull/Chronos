import { CalendarService, EventService } from '@/services';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ParticipantRole } from '@/entities';

interface CalendarQueryParams {
    page?: number;
    limit?: number;
    visibility?: 'visible' | 'hidden' | 'all';
}

export class CalendarController {
    private calendarService: CalendarService;
    private eventService: EventService;

    constructor() {
        this.calendarService = new CalendarService();
        this.eventService = new EventService();
    }

    async inviteUserByEmail(
        request: FastifyRequest<{
            Params: { id: string };
            Body: {
                email: string;
                role?: ParticipantRole;
                expireInDays?: number;
            };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const { email, role, expireInDays } = request.body;

            const emailInvite = await this.calendarService.inviteUserByEmail(request.user!.userId, id, email, role, expireInDays);

            return reply.status(201).send({
                status: 'success',
                message: `Invitation sent to ${email}`,
                data: emailInvite,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner or admin can invite users' || error.message === 'Cannot invite users to a personal calendar') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
                if (
                    error.message === 'This user is already a participant in the calendar' ||
                    error.message === 'An invitation has already been sent to this email'
                ) {
                    return reply.status(409).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getEmailInvites(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            const emailInvites = await this.calendarService.getCalendarEmailInvites(request.user!.userId, id);

            return reply.send({
                status: 'success',
                data: emailInvites,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner or admin can view invites') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async deleteEmailInvite(
        request: FastifyRequest<{
            Params: { calendarId: string; inviteId: string };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { inviteId } = request.params;
            await this.calendarService.deleteEmailInvite(request.user!.userId, inviteId);

            return reply.send({
                status: 'success',
                message: 'Invitation cancelled successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invitation not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner or admin can cancel invitations') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async getEmailInviteInfo(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
        try {
            const { token } = request.params;
            const inviteInfo = await this.calendarService.getEmailInviteInfo(token);

            return reply.send({
                status: 'success',
                data: inviteInfo,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Invitation not found or invalid' ||
                    error.message === 'Invitation has expired' ||
                    error.message === 'Calendar associated with this invitation was not found'
                ) {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async acceptEmailInvite(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
        try {
            const { token } = request.params;
            const calendar = await this.calendarService.acceptEmailInvite(request.user!.userId, token);

            return reply.send({
                status: 'success',
                message: `You've been added to "${calendar.name}" calendar`,
                data: calendar,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (
                    error.message === 'Invitation not found or invalid' ||
                    error.message === 'Calendar associated with this invitation was not found' ||
                    error.message === 'User not found'
                ) {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Invitation has expired') {
                    return reply.status(410).send({ status: 'error', message: error.message });
                }
                if (
                    error.message === 'This invitation was sent to a different email address' ||
                    error.message === 'You are already the owner of this calendar' ||
                    error.message === 'You are already a participant in this calendar'
                ) {
                    return reply.status(409).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async createCalendar(
        request: FastifyRequest<{
            Body: { name: string; description?: string; color: string };
        }>,
        reply: FastifyReply,
    ) {
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

    async getUserCalendars(request: FastifyRequest<{ Querystring: CalendarQueryParams }>, reply: FastifyReply) {
        try {
            const page = request.query.page || 1;
            const limit = request.query.limit || 7;
            const visibility = request.query.visibility || 'all';

            const { calendars, totalCount, visibleCount, hiddenCount, filteredCount } = await this.calendarService.getUserCalendars(
                request.user!.userId,
                page,
                limit,
                visibility,
            );

            return reply.send({
                status: 'success',
                data: calendars,
                pagination: {
                    page,
                    limit,
                    totalCount: filteredCount, // Use filtered count for pagination
                    totalPages: Math.ceil(filteredCount / limit),
                },
                counts: {
                    visible: visibleCount,
                    hidden: hiddenCount,
                    total: totalCount,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'User not found') {
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
            Querystring: {
                startDate?: string;
                endDate?: string;
                categoryId?: string | string[]; // Updated type
            };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { startDate, endDate, categoryId } = request.query;

            // Convert to array of category IDs if necessary
            const categoryIds = categoryId ? (Array.isArray(categoryId) ? categoryId : [categoryId]) : undefined;

            const events = await this.eventService.getEventsByCalendarId(
                request.user!.userId,
                request.params.id,
                startDate ? new Date(startDate) : undefined,
                endDate ? new Date(endDate) : undefined,
                categoryIds, // Pass array of categoryIds
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

    async toggleVisibility(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { isVisible: boolean };
        }>,
        reply: FastifyReply,
    ) {
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
            Body: { expireInDays?: number; role?: ParticipantRole };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            const { expireInDays } = request.body;
            const inviteLink = await this.calendarService.createInviteLink(request.user!.userId, id, expireInDays);
            const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/invite/${inviteLink.id}`;
            return reply.status(201).send({
                status: 'success',
                data: { ...inviteLink, inviteUrl },
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner or admin can create invite links') {
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
            const formattedLinks = inviteLinks.map(link => ({
                ...link,
                inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/invite/${link.id}`,
            }));
            return reply.send({ status: 'success', data: formattedLinks });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner or admin can view invite links') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async acceptInvite(
        request: FastifyRequest<{
            Params: { id: string };
            Body: { role?: ParticipantRole };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id } = request.params;
            // Extract role from body (undefined if not provided)
            const { role } = request.body || {};

            // Pass the role to the service
            const calendar = await this.calendarService.acceptInvite(request.user!.userId, id, role);

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
            return reply.send({ status: 'success', message: 'Invite link deleted successfully' });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Invite link not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Only the calendar owner or admin can delete invite links') {
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
            return reply.send({ status: 'success', data: calendarInfo });
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

    // New methods for participant role management
    async getCalendarParticipants(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;
            // First verify the user has access to this calendar
            await this.calendarService.getCalendarById(request.user!.userId, id);

            const participants = await this.calendarService.getCalendarParticipants(id);
            return reply.send({ status: 'success', data: participants });
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

    async updateParticipantRole(
        request: FastifyRequest<{
            Params: { id: string; userId: string };
            Body: { role: ParticipantRole };
        }>,
        reply: FastifyReply,
    ) {
        try {
            const { id, userId } = request.params;
            const { role } = request.body;

            const updatedParticipant = await this.calendarService.updateParticipantRole(request.user!.userId, id, userId, role);

            return reply.send({
                status: 'success',
                message: `User role updated to ${role}`,
                data: updatedParticipant,
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found' || error.message === 'Participant not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized to change participant roles' || error.message === 'Cannot change the role of the calendar owner') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async removeParticipant(request: FastifyRequest<{ Params: { id: string; userId: string } }>, reply: FastifyReply) {
        try {
            const { id, userId } = request.params;

            await this.calendarService.removeParticipant(request.user!.userId, id, userId);

            return reply.send({
                status: 'success',
                message: 'Participant removed successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found' || error.message === 'Participant not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'Not authorized to remove participants' || error.message === 'Cannot remove the calendar owner') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }

    async leaveCalendar(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        try {
            const { id } = request.params;

            await this.calendarService.leaveCalendar(request.user!.userId, id);

            return reply.send({
                status: 'success',
                message: 'You have left the calendar successfully',
            });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Calendar not found') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
                if (error.message === 'The owner cannot leave their own calendar') {
                    return reply.status(403).send({ status: 'error', message: error.message });
                }
                if (error.message === 'You are not a participant in this calendar') {
                    return reply.status(404).send({ status: 'error', message: error.message });
                }
            }
            request.log.error(error);
            return reply.status(500).send({ status: 'error', message: 'Internal server error' });
        }
    }
}
