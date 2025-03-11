import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { User, Event, EventCategory } from '.';

@Entity('calendars')
export class Calendar {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    name!: string;

    @Column({ type: 'varchar', nullable: true })
    description!: string;

    @Column({ type: 'varchar', default: '#000000' })
    color!: string;

    @Column({ type: 'boolean', default: false })
    isMain!: boolean;

    @Column({ type: 'boolean', default: false })
    isHoliday!: boolean;

    @Column({ type: 'boolean', default: true })
    isVisible!: boolean;

    @ManyToOne(() => User, user => user.ownedCalendars)
    @JoinColumn({ name: 'owner_id' })
    owner!: User;

    @ManyToMany(() => User, user => user.sharedCalendars)
    participants!: User[];

    @OneToMany(() => Event, event => event.calendar)
    events!: Event[];

    @OneToMany(() => EventCategory, category => category.calendar)
    categories!: EventCategory[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
