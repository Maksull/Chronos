import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { Calendar, User } from '.';

export enum EventCategory {
    ARRANGEMENT = 'ARRANGEMENT',
    REMINDER = 'REMINDER',
    TASK = 'TASK',
}

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'enum', enum: EventCategory })
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

    @ManyToOne(() => Calendar, calendar => calendar.events)
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator!: User;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'event_invitees',
        joinColumn: { name: 'event_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    invitees!: User[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
