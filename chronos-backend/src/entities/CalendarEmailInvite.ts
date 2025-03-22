import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Calendar, ParticipantRole } from '.';

@Entity('calendar_email_invites')
export class CalendarEmailInvite {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Calendar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @Column({ type: 'uuid' })
    calendarId!: string;

    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'enum', enum: ParticipantRole, default: ParticipantRole.READER })
    role!: ParticipantRole;

    @Column({ type: 'varchar', unique: true })
    token!: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
