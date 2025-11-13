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

@Entity('usage_tracking')
@Index(['userId', 'period'])
export class UsageTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Period identifier (e.g., '2024-11' for monthly tracking)
  @Column()
  period: string;

  // Resource counts
  @Column({ default: 0 })
  transactionsCount: number;

  @Column({ default: 0 })
  accountsCount: number;

  @Column({ default: 0 })
  budgetsCount: number;

  @Column({ default: 0 })
  groupsCount: number;

  @Column({ default: 0 })
  investmentsCount: number;

  @Column({ default: 0 })
  reportsCount: number;

  @Column({ default: 0 })
  apiCallsCount: number;

  @Column({ default: 0 })
  exportsCount: number;

  @Column({ default: 0 })
  importsCount: number;

  // Storage tracking (in bytes)
  @Column({ type: 'bigint', default: 0 })
  storageUsed: number;

  // Feature usage counts
  @Column({ default: 0 })
  aiAssistantCalls: number;

  @Column({ default: 0 })
  advancedAnalyticsViews: number;

  @Column({ default: 0 })
  insightsGenerated: number;

  // Last updated timestamps for each resource
  @Column({ type: 'json', nullable: true })
  lastUpdated: Record<string, Date>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
