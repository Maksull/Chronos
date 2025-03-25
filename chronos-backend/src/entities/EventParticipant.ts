import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Event, User } from '.';

@Entity('event_participants')
@Unique(['event', 'user'])
export class EventParticipant {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Event, event => event.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event!: Event;

    @Column({ type: 'uuid' })
    eventId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'boolean', default: false })
    hasConfirmed!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
