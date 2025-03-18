import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Calendar, User } from '.';

export enum ParticipantRole {
    ADMIN = 'admin', // Can do everything (manage calendars, participants, events)
    CREATOR = 'creator', // Can create and manage events, but not modify calendar settings
    READER = 'reader', // Can only view calendars and events
}

@Entity('calendar_participants')
@Unique(['calendar', 'user'])
export class CalendarParticipant {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Calendar, calendar => calendar.participantRoles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @Column({ type: 'uuid' })
    calendarId!: string;

    @ManyToOne(() => User, user => user.calendarParticipations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'enum', enum: ParticipantRole, default: ParticipantRole.READER })
    role!: ParticipantRole;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
