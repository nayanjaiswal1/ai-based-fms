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

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum BudgetType {
  CATEGORY = 'category',
  TAG = 'tag',
  OVERALL = 'overall',
  GROUP = 'group',
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'enum', enum: BudgetPeriod })
  period: BudgetPeriod;

  @Column({ type: 'enum', enum: BudgetType })
  type: BudgetType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  tagId: string;

  @Column({ nullable: true })
  groupId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  alertEnabled: boolean;

  @Column({ type: 'int', default: 80 })
  alertThreshold: number;

  @Column({ default: false })
  aiGenerated: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
