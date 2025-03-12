import { AppDataSource } from '@/database/data-source';
import { Calendar, User } from '@/entities';
import { CalendarInviteLink } from '@/entities/CalendarInviteLink';
import { seedDefaultCategories } from '@/utils/seedDefaultCategories';

interface CreateCalendarDto {
    name: string;
    description?: string;
    color: string;
}

interface UpdateCalendarDto {
    name?: string;
    description?: string;
    color?: string;
}

export class CalendarService {
    private calendarRepository = AppDataSource.getRepository(Calendar);
    private userRepository = AppDataSource.getRepository(User);
    private inviteLinkRepository = AppDataSource.getRepository(CalendarInviteLink);

    async createCalendar(userId: string, data: CreateCalendarDto): Promise<Calendar> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const calendar = this.calendarRepository.create({
            ...data,
            owner: user,
            isMain: false,
            isHoliday: false,
            isVisible: true,
        });

        const savedCalendar = await this.calendarRepository.save(calendar);

        // Seed default categories for the new calendar
        await seedDefaultCategories(savedCalendar.id);

        return savedCalendar;
    }

    async updateCalendar(userId: string, calendarId: string, data: UpdateCalendarDto): Promise<Calendar> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.owner.id !== userId) {
            throw new Error('Not authorized');
        }

        if (data.name !== undefined) calendar.name = data.name;
        if (data.description !== undefined) calendar.description = data.description;
        if (data.color !== undefined) calendar.color = data.color;

        return this.calendarRepository.save(calendar);
    }

    async getUserCalendars(userId: string): Promise<Calendar[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['ownedCalendars', 'sharedCalendars'],
        });

        if (!user) {
            throw new Error('User not found');
        }

        const ownedCalendars = user.ownedCalendars || [];
        const sharedCalendars = user.sharedCalendars || [];

        return [...ownedCalendars, ...sharedCalendars];
    }

    async getCalendarById(userId: string, calendarId: string): Promise<Calendar> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner', 'participants', 'categories'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        const isOwner = calendar.owner.id === userId;
        const isParticipant = calendar.participants?.some(participant => participant.id === userId) || false;

        if (!isOwner && !isParticipant) {
            throw new Error('Not authorized');
        }

        return calendar;
    }

    async toggleCalendarVisibility(userId: string, calendarId: string, isVisible: boolean): Promise<Calendar> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.owner.id !== userId) {
            throw new Error('Not authorized');
        }

        if (calendar.isMain) {
            throw new Error('Cannot modify main calendar visibility');
        }

        calendar.isVisible = isVisible;
        return this.calendarRepository.save(calendar);
    }

    async deleteCalendar(userId: string, calendarId: string): Promise<void> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.owner.id !== userId) {
            throw new Error('Not authorized');
        }

        if (calendar.isMain || calendar.isHoliday) {
            throw new Error('Cannot delete main or holiday calendar');
        }

        await this.calendarRepository.remove(calendar);
    }

    async createInviteLink(userId: string, calendarId: string, expireInDays?: number): Promise<CalendarInviteLink> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.owner.id !== userId) {
            throw new Error('Only the calendar owner can create invite links');
        }

        let expiresAt: Date | null = null;
        if (expireInDays) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expireInDays);
        }

        // Create the invite link with explicit calendar reference
        const inviteLink = this.inviteLinkRepository.create({
            calendarId,
            calendar, // Set the calendar reference explicitly
            expiresAt,
        });

        const savedInviteLink = await this.inviteLinkRepository.save(inviteLink);

        // For extra safety, fetch the saved link with its relations to return
        return this.inviteLinkRepository.findOne({
            where: { id: savedInviteLink.id },
            relations: ['calendar'],
        }) as Promise<CalendarInviteLink>;
    }

    async acceptInvite(userId: string, inviteLinkId: string): Promise<Calendar> {
        // Use a more explicit query with leftJoinAndSelect to ensure relationships are loaded
        const inviteLink = await this.inviteLinkRepository
            .createQueryBuilder('inviteLink')
            .leftJoinAndSelect('inviteLink.calendar', 'calendar')
            .leftJoinAndSelect('calendar.owner', 'owner')
            .leftJoinAndSelect('calendar.participants', 'participants')
            .where('inviteLink.id = :id', { id: inviteLinkId })
            .getOne();

        if (!inviteLink) {
            throw new Error('Invite link not found or invalid');
        }

        if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
            throw new Error('Invite link has expired');
        }

        if (!inviteLink.calendar) {
            throw new Error('Calendar associated with this invite link was not found');
        }

        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        const calendar = inviteLink.calendar;

        // Check if the user is already a participant or owner
        if (calendar.owner.id === userId) {
            throw new Error('You are already the owner of this calendar');
        }

        if (calendar.participants?.some(participant => participant.id === userId)) {
            throw new Error('You are already a participant in this calendar');
        }

        // Add user to participants
        if (!calendar.participants) {
            calendar.participants = [];
        }

        calendar.participants.push(user);

        return this.calendarRepository.save(calendar);
    }

    async getCalendarInviteLinks(userId: string, calendarId: string): Promise<CalendarInviteLink[]> {
        const calendar = await this.calendarRepository.findOne({
            where: { id: calendarId },
            relations: ['owner'],
        });

        if (!calendar) {
            throw new Error('Calendar not found');
        }

        if (calendar.owner.id !== userId) {
            throw new Error('Only the calendar owner can view invite links');
        }

        return this.inviteLinkRepository.find({
            where: { calendarId },
            order: { createdAt: 'DESC' },
        });
    }

    async deleteInviteLink(userId: string, inviteLinkId: string): Promise<void> {
        const inviteLink = await this.inviteLinkRepository.findOne({
            where: { id: inviteLinkId },
            relations: ['calendar', 'calendar.owner'],
        });

        if (!inviteLink) {
            throw new Error('Invite link not found');
        }

        if (inviteLink.calendar.owner.id !== userId) {
            throw new Error('Only the calendar owner can delete invite links');
        }

        await this.inviteLinkRepository.remove(inviteLink);
    }

    async getInviteLinkInfo(inviteLinkId: string): Promise<{ id: string; name: string }> {
        // Use a more explicit query with leftJoinAndSelect to ensure the calendar is loaded
        const inviteLink = await this.inviteLinkRepository
            .createQueryBuilder('inviteLink')
            .leftJoinAndSelect('inviteLink.calendar', 'calendar')
            .where('inviteLink.id = :id', { id: inviteLinkId })
            .getOne();

        if (!inviteLink) {
            throw new Error('Invite link not found or invalid');
        }

        if (inviteLink.expiresAt && inviteLink.expiresAt < new Date()) {
            throw new Error('Invite link has expired');
        }

        // Make sure calendar exists before accessing its properties
        if (!inviteLink.calendar) {
            throw new Error('Calendar associated with this invite link was not found');
        }

        return {
            id: inviteLink.calendar.id,
            name: inviteLink.calendar.name,
        };
    }
}
