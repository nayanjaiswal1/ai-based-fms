import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';
import { ReconciliationTransaction } from './reconciliation-transaction.entity';

export enum ReconciliationStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('reconciliations')
@Index(['accountId', 'status'])
@Index(['userId', 'createdAt'])
export class Reconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  statementBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  reconciledBalance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  difference: number;

  @Column({ type: 'enum', enum: ReconciliationStatus, default: ReconciliationStatus.IN_PROGRESS })
  status: ReconciliationStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', default: 0 })
  matchedCount: number;

  @Column({ type: 'int', default: 0 })
  unmatchedCount: number;

  @Column({ type: 'int', default: 0 })
  statementTransactionCount: number;

  @Column({ type: 'jsonb', nullable: true })
  summary: {
    totalMatched: number;
    totalUnmatched: number;
    discrepancyAmount: number;
    adjustments: Array<{
      type: string;
      amount: number;
      reason: string;
      timestamp: Date;
    }>;
  };

  @OneToMany(() => ReconciliationTransaction, (rt) => rt.reconciliation, { cascade: true })
  reconciliationTransactions: ReconciliationTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
