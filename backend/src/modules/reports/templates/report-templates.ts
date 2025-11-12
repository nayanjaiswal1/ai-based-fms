import {
  ReportType,
  ReportConfig,
  ReportDataSource,
  ReportMetric,
  ReportGroupBy,
} from '@database/entities/report.entity';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export interface ReportTemplate {
  type: ReportType;
  name: string;
  description: string;
  defaultConfig: ReportConfig;
  category: 'financial' | 'comparison' | 'analysis' | 'investment' | 'group';
}

const now = new Date();
const currentMonthStart = startOfMonth(now);
const currentMonthEnd = endOfMonth(now);
const currentYearStart = startOfYear(now);
const currentYearEnd = endOfYear(now);

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    type: ReportType.MONTHLY_SUMMARY,
    name: 'Monthly Financial Summary',
    description: 'Comprehensive overview of income, expenses, and savings for the current month',
    category: 'financial',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM, ReportMetric.COUNT],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
      },
      groupBy: [ReportGroupBy.CATEGORY],
      includeCharts: true,
      chartTypes: ['pie', 'bar'],
    },
  },
  {
    type: ReportType.TAX_REPORT,
    name: 'Tax Report',
    description: 'Income and deductible expenses by category for tax preparation',
    category: 'financial',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM],
      filters: {
        dateRange: {
          start: currentYearStart.toISOString(),
          end: currentYearEnd.toISOString(),
        },
      },
      groupBy: [ReportGroupBy.CATEGORY],
      includeCharts: true,
      chartTypes: ['bar'],
    },
  },
  {
    type: ReportType.YEAR_OVER_YEAR,
    name: 'Year-over-Year Comparison',
    description: 'Compare financial performance with the previous year',
    category: 'comparison',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM, ReportMetric.AVERAGE],
      filters: {
        dateRange: {
          start: currentYearStart.toISOString(),
          end: currentYearEnd.toISOString(),
        },
      },
      comparison: {
        type: 'year_over_year',
        periods: 2,
      },
      includeCharts: true,
      chartTypes: ['bar', 'line'],
    },
  },
  {
    type: ReportType.MONTH_OVER_MONTH,
    name: 'Month-over-Month Comparison',
    description: 'Track monthly trends in income and expenses',
    category: 'comparison',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM, ReportMetric.AVERAGE],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
      },
      comparison: {
        type: 'month_over_month',
        periods: 6,
      },
      includeCharts: true,
      chartTypes: ['line'],
    },
  },
  {
    type: ReportType.QUARTER_OVER_QUARTER,
    name: 'Quarter-over-Quarter Comparison',
    description: 'Quarterly financial performance analysis',
    category: 'comparison',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM, ReportMetric.AVERAGE],
      filters: {
        dateRange: {
          start: currentYearStart.toISOString(),
          end: currentYearEnd.toISOString(),
        },
      },
      comparison: {
        type: 'quarter_over_quarter',
        periods: 4,
      },
      includeCharts: true,
      chartTypes: ['bar'],
    },
  },
  {
    type: ReportType.BUDGET_VS_ACTUAL,
    name: 'Budget vs Actual Report',
    description: 'Compare actual spending against budgeted amounts by category',
    category: 'analysis',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS, ReportDataSource.BUDGETS],
      metrics: [ReportMetric.SUM],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
      },
      comparison: {
        type: 'budget_vs_actual',
      },
      groupBy: [ReportGroupBy.CATEGORY],
      includeCharts: true,
      chartTypes: ['bar'],
    },
  },
  {
    type: ReportType.CATEGORY_SPENDING,
    name: 'Category Spending Analysis',
    description: 'Detailed breakdown of expenses by category',
    category: 'analysis',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM, ReportMetric.COUNT],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
        transactionTypes: ['expense'],
      },
      groupBy: [ReportGroupBy.CATEGORY],
      sortBy: 'amount',
      sortOrder: 'desc',
      includeCharts: true,
      chartTypes: ['pie', 'bar'],
    },
  },
  {
    type: ReportType.INVESTMENT_PERFORMANCE,
    name: 'Investment Performance Report',
    description: 'Track returns and performance of all investments',
    category: 'investment',
    defaultConfig: {
      dataSources: [ReportDataSource.INVESTMENTS],
      metrics: [ReportMetric.SUM, ReportMetric.AVERAGE],
      filters: {
        dateRange: {
          start: currentYearStart.toISOString(),
          end: currentYearEnd.toISOString(),
        },
      },
      includeCharts: true,
      chartTypes: ['bar', 'line'],
    },
  },
  {
    type: ReportType.GROUP_EXPENSE_SETTLEMENT,
    name: 'Group Expense Settlement Report',
    description: 'Summary of shared expenses and settlement status',
    category: 'group',
    defaultConfig: {
      dataSources: [ReportDataSource.GROUPS],
      metrics: [ReportMetric.SUM, ReportMetric.COUNT],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
      },
      includeCharts: true,
      chartTypes: ['bar'],
    },
  },
  {
    type: ReportType.CASH_FLOW,
    name: 'Cash Flow Report',
    description: 'Track cash inflows and outflows over time',
    category: 'financial',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
      },
      groupBy: [ReportGroupBy.TYPE],
      includeCharts: true,
      chartTypes: ['line', 'bar'],
    },
  },
  {
    type: ReportType.NET_WORTH,
    name: 'Net Worth Statement',
    description: 'Comprehensive view of assets, liabilities, and net worth',
    category: 'financial',
    defaultConfig: {
      dataSources: [
        ReportDataSource.ACCOUNTS,
        ReportDataSource.INVESTMENTS,
        ReportDataSource.LEND_BORROW,
      ],
      metrics: [ReportMetric.SUM],
      filters: {
        dateRange: {
          start: now.toISOString(),
          end: now.toISOString(),
        },
      },
      includeCharts: true,
      chartTypes: ['pie', 'bar'],
    },
  },
  {
    type: ReportType.PROFIT_LOSS,
    name: 'Profit & Loss Statement',
    description: 'Income statement showing revenue, expenses, and net profit',
    category: 'financial',
    defaultConfig: {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM],
      filters: {
        dateRange: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString(),
        },
      },
      groupBy: [ReportGroupBy.CATEGORY, ReportGroupBy.TYPE],
      includeCharts: true,
      chartTypes: ['bar'],
    },
  },
];

export function getTemplateByType(type: ReportType): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((template) => template.type === type);
}

export function getTemplatesByCategory(category: string): ReportTemplate[] {
  return REPORT_TEMPLATES.filter((template) => template.category === category);
}

export function getAllTemplates(): ReportTemplate[] {
  return REPORT_TEMPLATES;
}
