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
import { User } from './user.entity';

export enum AddonType {
  STORAGE = 'storage',
  TRANSACTIONS = 'transactions',
  API_CALLS = 'api_calls',
  USERS = 'users',
  REPORTS = 'reports',
  CUSTOM_FEATURE = 'custom_feature',
}

export enum AddonStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}

@Entity('addons')
@Index(['userId', 'status'])
export class Addon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AddonType })
  type: AddonType;

  @Column({ type: 'enum', enum: AddonStatus, default: AddonStatus.ACTIVE })
  status: AddonStatus;

  // Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ default: false })
  isRecurring: boolean;

  // What this addon provides
  @Column({ type: 'int', nullable: true })
  quantity: number; // e.g., 100 additional transactions, 10GB storage

  @Column({ nullable: true })
  unit: string; // e.g., 'transactions', 'GB', 'API calls'

  // Stripe integration
  @Column({ nullable: true })
  stripeProductId: string;

  @Column({ nullable: true })
  stripePriceId: string;

  // Validity
  @Column({ type: 'timestamp', nullable: true })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  @Column({ type: 'timestamp', nullable: true })
  purchasedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt: Date;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
