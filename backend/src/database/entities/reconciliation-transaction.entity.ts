import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Reconciliation } from './reconciliation.entity';
import { Transaction } from './transaction.entity';

export enum MatchConfidence {
  EXACT = 'exact', // 100%
  HIGH = 'high', // 80-99%
  MEDIUM = 'medium', // 60-79%
  LOW = 'low', // <60%
  MANUAL = 'manual', // Manually matched
}

@Entity('reconciliation_transactions')
@Index(['reconciliationId', 'matched'])
export class ReconciliationTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reconciliationId: string;

  @ManyToOne(() => Reconciliation, (reconciliation) => reconciliation.reconciliationTransactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reconciliationId' })
  reconciliation: Reconciliation;

  @Column({ nullable: true })
  transactionId: string;

  @ManyToOne(() => Transaction, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ default: false })
  matched: boolean;

  @Column({ type: 'enum', enum: MatchConfidence, nullable: true })
  matchConfidence: MatchConfidence;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number;

  // Statement transaction data
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  statementAmount: number;

  @Column({ type: 'date' })
  statementDate: Date;

  @Column()
  statementDescription: string;

  @Column({ nullable: true })
  statementReferenceNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isManualMatch: boolean;

  @Column({ type: 'jsonb', nullable: true })
  matchingDetails: {
    amountMatch: boolean;
    dateMatch: boolean;
    descriptionSimilarity: number;
    dateDifference: number;
    possibleMatches?: Array<{
      transactionId: string;
      score: number;
      reason: string;
    }>;
  };

  @CreateDateColumn()
  createdAt: Date;
}
