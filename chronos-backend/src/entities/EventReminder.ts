import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '.';

@Entity('event_reminders')
export class EventReminder {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Event)
    @JoinColumn({ name: 'event_id' })
    event!: Event;

    @Column({ type: 'timestamp' })
    reminderTime!: Date;

    @Column({ type: 'boolean', default: false })
    isSent!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
