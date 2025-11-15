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

export enum EmailProvider {
  GMAIL = 'gmail',
  OUTLOOK = 'outlook',
  YAHOO = 'yahoo',
  IMAP = 'imap',
  OTHER = 'other',
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  SYNCING = 'syncing',
  EXPIRED = 'expired',
}

@Entity('email_connections')
export class EmailConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: EmailProvider })
  provider: EmailProvider;

  @Column({ type: 'text', nullable: true })
  encryptedPassword: string;

  @Column({ type: 'text', nullable: true })
  accessToken: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ nullable: true })
  imapHost: string;

  @Column({ type: 'int', nullable: true })
  imapPort: number;

  @Column({ default: true })
  useTLS: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.DISCONNECTED
  })
  status: ConnectionStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastSyncHistoryId: string;

  @Column({ default: 0 })
  transactionsExtracted: number;

  @Column({ default: 0 })
  ordersExtracted: number;

  @Column({ type: 'text', nullable: true })
  syncError: string;

  @Column({ default: true })
  autoSync: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    autoSync?: boolean;
    syncIntervalMinutes?: number;
    parseTransactions?: boolean;
    parseOrders?: boolean;
    filterLabels?: string[];
    filterSenders?: string[];
    notifyOnNewTransactions?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  syncStats: {
    totalEmailsProcessed?: number;
    transactionsExtracted?: number;
    ordersExtracted?: number;
    lastError?: string;
  };

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.emailConnections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
