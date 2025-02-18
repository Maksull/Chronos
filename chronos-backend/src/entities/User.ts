import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Calendar } from '.';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column({ type: 'varchar' })
    firstName!: string;

    @Column({ type: 'varchar' })
    lastName!: string;

    @Column({ type: 'varchar', nullable: true })
    region!: string;

    @OneToMany(() => Calendar, calendar => calendar.owner)
    ownedCalendars!: Calendar[];

    @ManyToMany(() => Calendar, calendar => calendar.participants)
    @JoinTable({
        name: 'user_calendars',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'calendar_id', referencedColumnName: 'id' },
    })
    sharedCalendars!: Calendar[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
