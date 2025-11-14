import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SharedExpenseGroup } from './shared-expense-group.entity';
import { Category } from './category.entity';

export enum SplitType {
  EQUAL = 'equal',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage',
  SHARES = 'shares',
  FULL = 'full', // For 1-to-1 debts
}

@Entity('shared_expense_transactions')
@Index(['groupId', 'date'])
export class SharedExpenseTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  paidBy: string; // participantId or userId

  @Column({ type: 'enum', enum: SplitType, default: SplitType.EQUAL })
  splitType: SplitType;

  @Column({ type: 'jsonb' })
  splits: Record<string, number>; // { participantId: amount }

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  groupId: string;

  @ManyToOne(() => SharedExpenseGroup, (group) => group.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: SharedExpenseGroup;

  @Column({ default: false })
  isSettlement: boolean;

  @Column({ nullable: true })
  deletedAt: Date; // Soft delete

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
