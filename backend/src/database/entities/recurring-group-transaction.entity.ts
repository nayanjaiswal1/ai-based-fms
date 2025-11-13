import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { SplitType } from './group-transaction.entity';

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum RecurrenceStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('recurring_group_transactions')
export class RecurringGroupTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  paidBy: string;

  @Column({ type: 'enum', enum: SplitType, default: SplitType.EQUAL })
  splitType: SplitType;

  @Column({ type: 'jsonb' })
  splits: Record<string, number>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  categoryId: string;

  @Column()
  groupId: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'enum', enum: RecurrenceFrequency })
  frequency: RecurrenceFrequency;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  maxOccurrences: number;

  @Column({ type: 'int', default: 0 })
  occurrencesCreated: number;

  @Column({ type: 'date', nullable: true })
  lastProcessedDate: Date;

  @Column({ type: 'date', nullable: true })
  nextProcessDate: Date;

  @Column({ type: 'enum', enum: RecurrenceStatus, default: RecurrenceStatus.ACTIVE })
  status: RecurrenceStatus;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
