import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { JobLog } from './job-log.entity';

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
  STUCK = 'stuck',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export enum JobType {
  EMAIL_SYNC = 'email_sync',
  TRANSACTION_IMPORT = 'transaction_import',
  REPORT_GENERATION = 'report_generation',
  INSIGHTS_GENERATION = 'insights_generation',
  BUDGET_REFRESH = 'budget_refresh',
  NOTIFICATION_DIGEST = 'notification_digest',
  CACHE_CLEANUP = 'cache_cleanup',
  BACKUP_VERIFICATION = 'backup_verification',
  ACCOUNT_RECONCILIATION = 'account_reconciliation',
  DATA_EXPORT = 'data_export',
}

export interface JobProgress {
  percentage: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  estimatedTimeRemaining?: number; // in seconds
  message?: string;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

@Entity('jobs')
@Index(['status', 'createdAt'])
@Index(['type', 'status'])
@Index(['queueName', 'status'])
@Index(['userId'])
@Index(['bullJobId'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bullJobId: string;

  @Column()
  queueName: string;

  @Column({ type: 'enum', enum: JobType })
  type: JobType;

  @Column({ type: 'enum', enum: JobStatus })
  status: JobStatus;

  @Column({ type: 'enum', enum: JobPriority, default: JobPriority.NORMAL })
  priority: JobPriority;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  progress: JobProgress;

  @Column({ type: 'jsonb', nullable: true })
  result: JobResult;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'text', nullable: true })
  stackTrace: string;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 3 })
  maxAttempts: number;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ nullable: true })
  processedBy: string; // Worker ID that processed the job

  @Column({ default: 0 })
  duration: number; // in milliseconds

  @Column({ nullable: true })
  timeout: number; // in milliseconds

  @Column({ default: false })
  isDuplicate: boolean;

  @Column({ nullable: true })
  deduplicationKey: string;

  @Column({ nullable: true })
  rateLimitKey: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => JobLog, (jobLog) => jobLog.job)
  logs: JobLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
