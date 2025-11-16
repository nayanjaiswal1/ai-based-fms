import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { EmailConnection } from './email-connection.entity';

export enum ParsingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped', // No transaction data found
  MANUALLY_EDITED = 'manually_edited',
}

@Entity('email_messages')
export class EmailMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  connectionId: string;

  @ManyToOne(() => EmailConnection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'connectionId' })
  connection: EmailConnection;

  // Gmail-specific ID
  @Column({ type: 'varchar', length: 100, unique: true })
  messageId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  threadId: string;

  // Email metadata
  @Column({ type: 'varchar', length: 500 })
  from: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  to: string;

  @Column({ type: 'varchar', length: 1000 })
  subject: string;

  @Column({ type: 'timestamp' })
  emailDate: Date;

  // Email content
  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({ type: 'text', nullable: true })
  htmlContent: string;

  @Column({ type: 'jsonb', nullable: true })
  headers: {
    [key: string]: string;
  };

  // Parsing status
  @Column({
    type: 'enum',
    enum: ParsingStatus,
    default: ParsingStatus.PENDING,
  })
  parsingStatus: ParsingStatus;

  @Column({ type: 'timestamp', nullable: true })
  parsedAt: Date;

  @Column({ type: 'int', default: 0 })
  parseAttempts: number;

  @Column({ type: 'text', nullable: true })
  parsingError: string;

  // Parsed data
  @Column({ type: 'jsonb', nullable: true })
  parsedData: {
    transactions?: Array<{
      amount: number;
      currency?: string;
      date: string;
      description: string;
      merchant?: string;
      type: 'income' | 'expense';
      confidence: number;
      saved?: boolean; // Whether this was saved to transactions table
      transactionId?: string; // ID of created transaction
    }>;
    orders?: Array<{
      orderId?: string;
      amount?: number;
      items?: string[];
      trackingNumber?: string;
    }>;
    aiProvider?: string; // Which AI was used (openai, ollama, pattern-matching)
    aiModel?: string;
  };

  // User edits
  @Column({ type: 'jsonb', nullable: true })
  manualEdits: {
    editedBy?: string;
    editedAt?: Date;
    originalData?: any;
    editedData?: any;
    notes?: string;
  };

  // Classification
  @Column({ type: 'jsonb', nullable: true, array: true })
  labels: string[];

  @Column({ type: 'boolean', default: false })
  isStarred: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  // Stats
  @Column({ type: 'int', nullable: true })
  attachmentCount: number;

  @Column({ type: 'int', nullable: true })
  bodySize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
