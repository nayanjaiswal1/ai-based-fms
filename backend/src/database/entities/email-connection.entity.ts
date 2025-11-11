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

@Entity('email_connections')
export class EmailConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: EmailProvider })
  provider: EmailProvider;

  @Column({ type: 'text' })
  encryptedPassword: string;

  @Column({ nullable: true })
  imapHost: string;

  @Column({ type: 'int', nullable: true })
  imapPort: number;

  @Column({ default: true })
  useTLS: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastSyncAt: Date;

  @Column({ default: 0 })
  transactionsExtracted: number;

  @Column({ type: 'text', nullable: true })
  syncError: string;

  @Column({ default: true })
  autoSync: boolean;

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
