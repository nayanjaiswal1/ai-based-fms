import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from './transaction.entity';
import { Budget } from './budget.entity';
import { GroupMember } from './group-member.entity';
import { Investment } from './investment.entity';
import { LendBorrow } from './lend-borrow.entity';
import { Notification } from './notification.entity';
import { Reminder } from './reminder.entity';
import { EmailConnection } from './email-connection.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE })
  subscriptionTier: SubscriptionTier;

  @Column({ nullable: true })
  subscriptionExpiry: Date;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'US' })
  region: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpiry: Date;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user)
  groupMemberships: GroupMember[];

  @OneToMany(() => Investment, (investment) => investment.user)
  investments: Investment[];

  @OneToMany(() => LendBorrow, (lendBorrow) => lendBorrow.user)
  lendBorrowRecords: LendBorrow[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => EmailConnection, (emailConnection) => emailConnection.user)
  emailConnections: EmailConnection[];

  @OneToMany(() => Category, (category) => category.user)
  customCategories: Category[];

  @OneToMany(() => Tag, (tag) => tag.user)
  customTags: Tag[];
}
