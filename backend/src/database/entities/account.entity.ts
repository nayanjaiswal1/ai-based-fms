import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

export enum AccountType {
  BANK = 'bank',
  WALLET = 'wallet',
  CASH = 'cash',
  CARD = 'card',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export enum AccountReconciliationStatus {
  NONE = 'none',
  IN_PROGRESS = 'in_progress',
  RECONCILED = 'reconciled',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  includeInTotal: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: AccountReconciliationStatus,
    default: AccountReconciliationStatus.NONE,
  })
  reconciliationStatus: AccountReconciliationStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastReconciledAt: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  lastReconciledBalance: number;

  @Column({ type: 'text', nullable: true })
  statementPassword: string; // Encrypted password for password-protected statements

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
