import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Calendar, User, EventCategory, EventParticipant } from '.';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    name!: string;

    @ManyToOne(() => EventCategory, category => category.events)
    @JoinColumn({ name: 'category_id' })
    category!: EventCategory;

    @Column({ type: 'timestamp' })
    startDate!: Date;

    @Column({ type: 'timestamp' })
    endDate!: Date;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @Column({ type: 'varchar', default: '#000000' })
    color!: string;

    @Column({ type: 'boolean', default: false })
    isCompleted!: boolean;

    @ManyToOne(() => Calendar, calendar => calendar.events, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator!: User;

    // Replace @ManyToMany with @OneToMany to use the EventParticipant entity
    @OneToMany(() => EventParticipant, participant => participant.event, { cascade: true })
    participants!: EventParticipant[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
