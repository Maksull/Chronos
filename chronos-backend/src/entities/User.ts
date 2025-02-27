import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Calendar } from '.';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true })
    username!: string;

    @Column({ type: 'varchar' })
    email!: string;

    @Column({ type: 'varchar' })
    password!: string;

    @Column({ type: 'varchar', nullable: true })
    fullName!: string;

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

    @Column({ type: 'boolean', default: false })
    isEmailVerified!: boolean;

    @Column({ type: 'varchar', nullable: true })
    newEmail!: string | null;

    @Column({ type: 'varchar', length: 6, nullable: true })
    verificationCode!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    verificationCodeExpiresAt!: Date | null;

    @Column({ type: 'varchar', length: 6, nullable: true })
    emailChangeCode!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    emailChangeCodeExpiresAt!: Date | null;
}
