import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ReminderType {
  BILL = 'bill',
  REPAYMENT = 'repayment',
  GOAL = 'goal',
  CUSTOM = 'custom',
}

export enum ReminderFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ReminderStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReminderType })
  type: ReminderType;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'enum', enum: ReminderFrequency, default: ReminderFrequency.ONCE })
  frequency: ReminderFrequency;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: ReminderStatus, default: ReminderStatus.ACTIVE })
  status: ReminderStatus;

  @Column({ default: true })
  notificationEnabled: boolean;

  @Column({ type: 'int', default: 1 })
  notifyDaysBefore: number;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  lendBorrowId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
