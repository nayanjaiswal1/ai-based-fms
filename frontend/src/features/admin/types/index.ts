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

export enum JobLogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export interface JobProgress {
  percentage: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  estimatedTimeRemaining?: number;
  message?: string;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Job {
  id: string;
  bullJobId: string;
  queueName: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  data: Record<string, any>;
  progress?: JobProgress;
  result?: JobResult;
  error?: string;
  stackTrace?: string;
  attempts: number;
  maxAttempts: number;
  userId?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  processedBy?: string;
  duration: number;
  timeout?: number;
  isDuplicate: boolean;
  deduplicationKey?: string;
  rateLimitKey?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface JobLog {
  id: string;
  jobId: string;
  level: JobLogLevel;
  message: string;
  context?: Record<string, any>;
  stackTrace?: string;
  createdAt: string;
}

export interface JobStatistics {
  total: number;
  byStatus: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
  successRate: number;
  avgDuration: number;
  byType: Array<{
    type: JobType;
    count: number;
    completed: number;
    failed: number;
    avgDuration: number;
  }>;
}

export interface QueueStatus {
  queueName: string;
  isPaused: boolean;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
}

export interface JobQuery {
  status?: JobStatus;
  type?: JobType;
  queueName?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export enum QueueAction {
  PAUSE = 'pause',
  RESUME = 'resume',
  CLEAN = 'clean',
  DRAIN = 'drain',
}
