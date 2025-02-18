import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Calendar } from '.';

@Entity('calendar_settings')
export class CalendarSettings {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => Calendar)
    @JoinColumn({ name: 'calendar_id' })
    calendar!: Calendar;

    @Column({ type: 'boolean', default: true })
    showWeekNumbers!: boolean;

    @Column({ type: 'varchar', default: 'month' })
    defaultView!: string;

    @Column({ type: 'integer', default: 30 })
    defaultEventDuration!: number;

    @Column('simple-array', { default: '[]' })
    enabledCategories!: string[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
