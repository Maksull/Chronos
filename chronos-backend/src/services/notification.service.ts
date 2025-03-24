import { AppDataSource } from '@/database/data-source';
import { Calendar, User, CalendarParticipant, Event, ParticipantRole } from '@/entities';
import { EmailService } from './email.service';

export enum NotificationType {
    EVENT_CREATED = 'EVENT_CREATED',
    EVENT_UPDATED = 'EVENT_UPDATED',
    EVENT_DELETED = 'EVENT_DELETED',
    CALENDAR_UPDATED = 'CALENDAR_UPDATED',
    PARTICIPANT_ADDED = 'PARTICIPANT_ADDED',
    PARTICIPANT_REMOVED = 'PARTICIPANT_REMOVED',
    PARTICIPANT_ROLE_CHANGED = 'PARTICIPANT_ROLE_CHANGED',
}

export class NotificationService {
    private participantRepository = AppDataSource.getRepository(CalendarParticipant);
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    private async getAllCalendarParticipants(calendarId: string): Promise<{ email: string; username: string; userId: string }[]> {
        // Find the calendar owner and all participants
        const calendar = await AppDataSource.getRepository(Calendar).findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Get all participants
        const participants = await this.participantRepository
            .createQueryBuilder('participant')
            .innerJoinAndSelect('participant.user', 'user')
            .where('participant.calendarId = :calendarId', { calendarId })
            .getMany();

        // Create a set to track unique users (to avoid duplicates)
        const userIds = new Set<string>();
        const allRecipients = [];

        // Add owner
        allRecipients.push({
            email: calendar.owner.email,
            username: calendar.owner.username,
            userId: calendar.owner.id,
        });
        userIds.add(calendar.owner.id);

        // Add all participants
        participants.forEach(p => {
            if (!userIds.has(p.userId)) {
                allRecipients.push({
                    email: p.user.email,
                    username: p.user.username,
                    userId: p.userId,
                });
                userIds.add(p.userId);
            }
        });

        return allRecipients;
    }

    async notifyEventCreated(initiatorId: string, calendarId: string, event: Event): Promise<void> {
        const recipients = await this.getAllCalendarParticipants(calendarId);
        const initiator = await AppDataSource.getRepository(User).findOne({
            where: { id: initiatorId },
        });

        if (!initiator) {
            throw new Error('Initiator user not found');
        }

        const calendar = await AppDataSource.getRepository(Calendar).findOne({
            where: { id: calendarId },
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Format dates
        const startDate = new Date(event.startDate).toLocaleString();
        const endDate = new Date(event.endDate).toLocaleString();

        for (const recipient of recipients) {
            // Customize message based on whether recipient is the initiator
            const isInitiator = recipient.userId === initiatorId;

            await this.emailService.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@example.com',
                to: recipient.email,
                subject: `New Event: ${event.name} in ${calendar.name}`,
                html: `
          <h1>New Event Added</h1>
          <p>Hello ${recipient.username},</p>
          ${
              isInitiator
                  ? `<p>You have successfully added a new event to the calendar <strong>${calendar.name}</strong>.</p>`
                  : `<p><strong>${initiator.username}</strong> has added a new event to the calendar <strong>${calendar.name}</strong>.</p>`
          }
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: ${event.color || '#4A6FA5'};">${event.name}</h2>
            <p><strong>Start:</strong> ${startDate}</p>
            <p><strong>End:</strong> ${endDate}</p>
            ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
          </div>
          
          <p>Log in to view the complete details.</p>
        `,
            });
        }
    }

    async notifyEventUpdated(initiatorId: string, calendarId: string, event: Event, changedFields: string[]): Promise<void> {
        const recipients = await this.getAllCalendarParticipants(calendarId);
        const initiator = await AppDataSource.getRepository(User).findOne({
            where: { id: initiatorId },
        });

        if (!initiator) {
            throw new Error('Initiator user not found');
        }

        const calendar = await AppDataSource.getRepository(Calendar).findOne({
            where: { id: calendarId },
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Format dates
        const startDate = new Date(event.startDate).toLocaleString();
        const endDate = new Date(event.endDate).toLocaleString();

        // Create a summary of what changed
        const changesSummary = changedFields
            .map(field => {
                switch (field) {
                    case 'name':
                        return 'Event name';
                    case 'startDate':
                        return 'Start time';
                    case 'endDate':
                        return 'End time';
                    case 'description':
                        return 'Description';
                    case 'color':
                        return 'Color';
                    case 'isCompleted':
                        return 'Completion status';
                    case 'categoryId':
                        return 'Category';
                    case 'invitees':
                        return 'Invitees list';
                    default:
                        return field;
                }
            })
            .join(', ');

        for (const recipient of recipients) {
            // Customize message based on whether recipient is the initiator
            const isInitiator = recipient.userId === initiatorId;

            await this.emailService.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@example.com',
                to: recipient.email,
                subject: `Event Updated: ${event.name} in ${calendar.name}`,
                html: `
          <h1>Event Updated</h1>
          <p>Hello ${recipient.username},</p>
          ${
              isInitiator
                  ? `<p>You have updated the event <strong>${event.name}</strong> in the calendar <strong>${calendar.name}</strong>.</p>`
                  : `<p><strong>${initiator.username}</strong> has updated the event <strong>${event.name}</strong> in the calendar <strong>${calendar.name}</strong>.</p>`
          }
          
          <p>Changes made to: ${changesSummary}</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: ${event.color || '#4A6FA5'};">${event.name}</h2>
            <p><strong>Start:</strong> ${startDate}</p>
            <p><strong>End:</strong> ${endDate}</p>
            ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
          </div>
          
          <p>Log in to view the complete details.</p>
        `,
            });
        }
    }

    async notifyEventDeleted(initiatorId: string, calendarId: string, eventName: string): Promise<void> {
        const recipients = await this.getAllCalendarParticipants(calendarId);
        const initiator = await AppDataSource.getRepository(User).findOne({
            where: { id: initiatorId },
        });

        if (!initiator) {
            throw new Error('Initiator user not found');
        }

        const calendar = await AppDataSource.getRepository(Calendar).findOne({
            where: { id: calendarId },
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        for (const recipient of recipients) {
            // Customize message based on whether recipient is the initiator
            const isInitiator = recipient.userId === initiatorId;

            await this.emailService.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@example.com',
                to: recipient.email,
                subject: `Event Deleted: ${eventName} from ${calendar.name}`,
                html: `
          <h1>Event Deleted</h1>
          <p>Hello ${recipient.username},</p>
          ${
              isInitiator
                  ? `<p>You have deleted the event <strong>${eventName}</strong> from the calendar <strong>${calendar.name}</strong>.</p>`
                  : `<p><strong>${initiator.username}</strong> has deleted the event <strong>${eventName}</strong> from the calendar <strong>${calendar.name}</strong>.</p>`
          }
          <p>Log in to view your updated calendar.</p>
        `,
            });
        }
    }

    async notifyCalendarUpdated(initiatorId: string, calendarId: string, changedFields: string[]): Promise<void> {
        const recipients = await this.getAllCalendarParticipants(calendarId);
        const initiator = await AppDataSource.getRepository(User).findOne({
            where: { id: initiatorId },
        });

        if (!initiator) {
            throw new Error('Initiator user not found');
        }

        const calendar = await AppDataSource.getRepository(Calendar).findOne({
            where: { id: calendarId },
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Create a summary of what changed
        const changesSummary = changedFields
            .map(field => {
                switch (field) {
                    case 'name':
                        return 'Calendar name';
                    case 'description':
                        return 'Description';
                    case 'color':
                        return 'Color';
                    case 'isVisible':
                        return 'Visibility';
                    default:
                        return field;
                }
            })
            .join(', ');

        for (const recipient of recipients) {
            // Customize message based on whether recipient is the initiator
            const isInitiator = recipient.userId === initiatorId;

            await this.emailService.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@example.com',
                to: recipient.email,
                subject: `Calendar Updated: ${calendar.name}`,
                html: `
          <h1>Calendar Updated</h1>
          <p>Hello ${recipient.username},</p>
          ${
              isInitiator
                  ? `<p>You have updated the calendar <strong>${calendar.name}</strong>.</p>`
                  : `<p><strong>${initiator.username}</strong> has updated the calendar <strong>${calendar.name}</strong>.</p>`
          }
          
          <p>Changes made to: ${changesSummary}</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: ${calendar.color || '#4A6FA5'};">${calendar.name}</h2>
            ${calendar.description ? `<p>${calendar.description}</p>` : ''}
          </div>
          
          <p>Log in to view the complete details.</p>
        `,
            });
        }
    }

    async notifyParticipantAdded(initiatorId: string, calendarId: string, newParticipantId: string, role: ParticipantRole): Promise<void> {
        // Get all calendar participants (this won't include the new participant yet since they were just added)
        const recipients = await this.getAllCalendarParticipants(calendarId);

        // Get the initiator info
        const initiator = await AppDataSource.getRepository(User).findOne({
            where: { id: initiatorId },
        });

        if (!initiator) {
            throw new Error('Initiator user not found');
        }

        // Get the calendar info
        const calendar = await AppDataSource.getRepository(Calendar).findOne({
            where: { id: calendarId },
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        // Get the new participant info
        const newParticipant = await AppDataSource.getRepository(User).findOne({
            where: { id: newParticipantId },
        });

        if (!newParticipant) {
            throw new Error('New participant not found');
        }

        // Add the new participant to the recipients list if they're not already there
        const newParticipantInList = recipients.some(r => r.userId === newParticipantId);
        if (!newParticipantInList) {
            recipients.push({
                email: newParticipant.email,
                username: newParticipant.username,
                userId: newParticipantId,
            });
        }

        for (const recipient of recipients) {
            // Check if recipient is the initiator or the new participant
            const isInitiator = recipient.userId === initiatorId;
            const isNewParticipant = recipient.userId === newParticipantId;

            let subject, htmlContent;

            if (isNewParticipant) {
                // Message for the newly added participant
                subject = `Welcome to ${calendar.name}`;
                htmlContent = `
          <h1>Welcome to ${calendar.name}</h1>
          <p>Hello ${recipient.username},</p>
          <p>You have been added to the calendar <strong>${calendar.name}</strong> with the role of <strong>${role}</strong>.</p>
          <p>Log in to view this calendar and its events.</p>
        `;
            } else {
                // Message for existing participants (including the initiator)
                subject = `New Participant in ${calendar.name}`;
                htmlContent = `
          <h1>New Participant Added</h1>
          <p>Hello ${recipient.username},</p>
          ${
              isInitiator
                  ? `<p>You have added <strong>${newParticipant.username}</strong> to the calendar <strong>${calendar.name}</strong> with the role of <strong>${role}</strong>.</p>`
                  : `<p><strong>${initiator.username}</strong> has added <strong>${newParticipant.username}</strong> to the calendar <strong>${calendar.name}</strong> with the role of <strong>${role}</strong>.</p>`
          }
          <p>Log in to see the updated participant list.</p>
        `;
            }

            await this.emailService.sendMail({
                from: process.env.EMAIL_FROM || 'noreply@example.com',
                to: recipient.email,
                subject,
                html: htmlContent,
            });
        }
    }
}
