import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Calendar, Event } from '.';

@Entity('event_categories')
export class EventCategory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @Column({ type: 'varchar', default: '#000000' })
    color!: string;

    @ManyToOne(() => Calendar, calendar => calendar.categories)
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @OneToMany(() => Event, event => event.category)
    events!: Event[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
