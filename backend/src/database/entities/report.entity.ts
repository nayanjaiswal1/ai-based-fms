import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { GeneratedReport } from './generated-report.entity';

export enum ReportType {
  CUSTOM = 'custom',
  MONTHLY_SUMMARY = 'monthly_summary',
  TAX_REPORT = 'tax_report',
  YEAR_OVER_YEAR = 'year_over_year',
  MONTH_OVER_MONTH = 'month_over_month',
  QUARTER_OVER_QUARTER = 'quarter_over_quarter',
  BUDGET_VS_ACTUAL = 'budget_vs_actual',
  CATEGORY_SPENDING = 'category_spending',
  INVESTMENT_PERFORMANCE = 'investment_performance',
  GROUP_EXPENSE_SETTLEMENT = 'group_expense_settlement',
  CASH_FLOW = 'cash_flow',
  NET_WORTH = 'net_worth',
  PROFIT_LOSS = 'profit_loss',
}

export enum ReportScheduleFrequency {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export enum ReportDataSource {
  TRANSACTIONS = 'transactions',
  BUDGETS = 'budgets',
  INVESTMENTS = 'investments',
  ACCOUNTS = 'accounts',
  GROUPS = 'groups',
  LEND_BORROW = 'lend_borrow',
}

export enum ReportMetric {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  TREND = 'trend',
}

export enum ReportGroupBy {
  CATEGORY = 'category',
  ACCOUNT = 'account',
  MONTH = 'month',
  YEAR = 'year',
  QUARTER = 'quarter',
  TAG = 'tag',
  TYPE = 'type',
}

export interface ReportConfig {
  // Data source configuration
  dataSources: ReportDataSource[];

  // Metrics to calculate
  metrics: ReportMetric[];

  // Filters
  filters: {
    dateRange?: {
      start: string;
      end: string;
    };
    categories?: string[];
    accounts?: string[];
    tags?: string[];
    transactionTypes?: string[];
    amountRange?: {
      min: number;
      max: number;
    };
  };

  // Grouping and sorting
  groupBy?: ReportGroupBy[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;

  // Comparison settings (for YoY, MoM, etc.)
  comparison?: {
    type: 'year_over_year' | 'month_over_month' | 'quarter_over_quarter' | 'budget_vs_actual';
    periods?: number;
  };

  // Visualization settings
  includeCharts?: boolean;
  chartTypes?: string[];

  // Custom fields
  customFields?: Record<string, any>;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: ReportScheduleFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time?: string; // HH:mm format
  emailRecipients?: string[];
  lastRun?: Date;
  nextRun?: Date;
}

@Entity('reports')
@Index(['userId', 'type'])
@Index(['userId', 'isFavorite'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'jsonb' })
  config: ReportConfig;

  @Column({ type: 'jsonb', nullable: true })
  schedule: ReportSchedule;

  @Column({ default: false })
  isFavorite: boolean;

  @Column({ default: false })
  isShared: boolean;

  @Column({ type: 'simple-array', nullable: true })
  sharedWithGroupIds: string[];

  @Column({ default: 0 })
  runCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastRunAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => GeneratedReport, (generatedReport) => generatedReport.report)
  generatedReports: GeneratedReport[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
