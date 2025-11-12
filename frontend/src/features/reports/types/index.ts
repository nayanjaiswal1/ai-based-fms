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

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum GeneratedReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ReportConfig {
  dataSources: ReportDataSource[];
  metrics: ReportMetric[];
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
  groupBy?: ReportGroupBy[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  comparison?: {
    type: 'year_over_year' | 'month_over_month' | 'quarter_over_quarter' | 'budget_vs_actual';
    periods?: number;
  };
  includeCharts?: boolean;
  chartTypes?: string[];
  customFields?: Record<string, any>;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: ReportScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  time?: string;
  emailRecipients?: string[];
  lastRun?: Date;
  nextRun?: Date;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: ReportSchedule;
  isFavorite: boolean;
  isShared: boolean;
  sharedWithGroupIds?: string[];
  runCount: number;
  lastRunAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedReport {
  id: string;
  reportId: string;
  format: ReportFormat;
  status: GeneratedReportStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  metadata?: Record<string, any>;
  error?: string;
  expiresAt?: Date;
  createdAt: Date;
  generatedBy?: string;
}

export interface ReportTemplate {
  type: ReportType;
  name: string;
  description: string;
  defaultConfig: ReportConfig;
  category: 'financial' | 'comparison' | 'analysis' | 'investment' | 'group';
}

export interface CreateReportDto {
  name: string;
  description?: string;
  type: ReportType;
  config: ReportConfig;
  schedule?: ReportSchedule;
  isFavorite?: boolean;
  isShared?: boolean;
  sharedWithGroupIds?: string[];
}

export interface UpdateReportDto {
  name?: string;
  description?: string;
  type?: ReportType;
  config?: ReportConfig;
  schedule?: ReportSchedule;
  isFavorite?: boolean;
  isShared?: boolean;
  sharedWithGroupIds?: string[];
}

export interface GenerateReportDto {
  format: ReportFormat;
  emailTo?: string;
  overrideConfig?: Record<string, any>;
}

export interface QueryReportsDto {
  type?: ReportType;
  isFavorite?: boolean;
  isShared?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReportData {
  summary: Record<string, any>;
  details: any[];
  charts?: any[];
  metadata: {
    generatedAt: Date;
    dataRange: { start: Date; end: Date };
    recordCount: number;
  };
}
