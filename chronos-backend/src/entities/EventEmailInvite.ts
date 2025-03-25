import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '.';

@Entity('event_email_invites')
export class EventEmailInvite {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Event, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event!: Event;

    @Column({ type: 'uuid' })
    eventId!: string;

    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'uuid', nullable: true })
    userId!: string | null;

    @Column({ type: 'varchar' })
    token!: string;

    @Column({ type: 'timestamp', nullable: true })
    expiresAt!: Date | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
