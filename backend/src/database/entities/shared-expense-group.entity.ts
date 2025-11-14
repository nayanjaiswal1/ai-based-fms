import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SharedExpenseParticipant } from './shared-expense-participant.entity';
import { SharedExpenseTransaction } from './shared-expense-transaction.entity';

export enum SharedExpenseType {
  PERSONAL_DEBT = 'personal_debt',
  GROUP_EXPENSE = 'group_expense',
  TRIP = 'trip',
  HOUSEHOLD = 'household',
}

export enum DebtDirection {
  LEND = 'lend',
  BORROW = 'borrow',
}

@Entity('shared_expense_groups')
@Index(['createdBy', 'isOneToOne'])
@Index(['isOneToOne', 'isActive'])
export class SharedExpenseGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: SharedExpenseType })
  type: SharedExpenseType;

  // Explicit 1-to-1 flag for fast queries
  @Column({ default: false })
  isOneToOne: boolean;

  @Column({ type: 'int', default: 2 })
  participantCount: number;

  // For 1-to-1 debts: denormalized other person info
  @Column({ nullable: true })
  otherPersonName: string;

  @Column({ nullable: true })
  otherPersonEmail: string;

  @Column({ nullable: true })
  otherPersonPhone: string;

  // Debt direction (for 1-to-1 only)
  @Column({
    type: 'enum',
    enum: DebtDirection,
    nullable: true,
  })
  debtDirection: DebtDirection;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  createdBy: string;

  @OneToMany(() => SharedExpenseParticipant, (participant) => participant.group)
  participants: SharedExpenseParticipant[];

  @OneToMany(() => SharedExpenseTransaction, (transaction) => transaction.group)
  transactions: SharedExpenseTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
