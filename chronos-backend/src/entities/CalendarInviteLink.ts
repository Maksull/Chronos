import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Calendar } from '.';

@Entity('calendar_invite_links')
export class CalendarInviteLink {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Calendar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @Column({ type: 'uuid' })
    calendarId!: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;
}
