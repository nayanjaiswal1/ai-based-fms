import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Account } from './account.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { TransactionLineItem } from './transaction-line-item.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  LEND = 'lend',
  BORROW = 'borrow',
  GROUP = 'group',
}

export enum TransactionSource {
  MANUAL = 'manual',
  EMAIL = 'email',
  FILE_IMPORT = 'file_import',
  API = 'api',
  CHAT = 'chat',
}

export enum TransactionSourceType {
  MANUAL = 'manual',
  INVESTMENT = 'investment',
  SHARED_EXPENSE = 'shared_expense',
  RECURRING = 'recurring',
}

@Entity('transactions')
@Index(['userId', 'date'])
@Index(['userId', 'type'])
@Index(['accountId', 'date'])
@Index(['sourceType', 'sourceId'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: TransactionSource, default: TransactionSource.MANUAL })
  source: TransactionSource;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ default: false })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurringFrequency: string;

  @Column({ nullable: true })
  transferToAccountId: string;

  @Column({ nullable: true })
  groupTransactionId: string;

  @Column({ nullable: true })
  lendBorrowId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Merge/duplicate detection fields
  @Column({ nullable: true })
  mergedIntoId?: string;

  @Column({ default: false })
  isMerged: boolean;

  @Column({ type: 'timestamp', nullable: true })
  mergedAt?: Date;

  @Column({ type: 'simple-array', nullable: true })
  duplicateExclusions: string[];

  // Source tracking for navigation
  @Column({
    type: 'enum',
    enum: TransactionSourceType,
    default: TransactionSourceType.MANUAL,
  })
  sourceType: TransactionSourceType;

  @Column({ nullable: true })
  sourceId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  accountId: string;

  @ManyToOne(() => Account, (account) => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.transactions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.transactions)
  @JoinTable({
    name: 'transaction_tags',
    joinColumn: { name: 'transactionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @OneToMany(() => TransactionLineItem, (lineItem) => lineItem.transaction)
  lineItems: TransactionLineItem[];

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: true })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
