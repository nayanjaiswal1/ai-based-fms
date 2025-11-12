import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Transaction, TransactionType } from '../../database/entities/transaction.entity';
import { Budget } from '../../database/entities/budget.entity';
import { Account } from '../../database/entities/account.entity';
import { Category } from '../../database/entities/category.entity';
import { Tag } from '../../database/entities/tag.entity';
import { ExportTransactionsDto } from './dto/export-transactions.dto';
import { ExportBudgetsDto } from './dto/export-budgets.dto';
import { ExportAnalyticsDto } from './dto/export-analytics.dto';
import { format } from 'date-fns';
import { Readable } from 'stream';
import * as fastcsv from 'fast-csv';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  // ==================== Transaction Exports ====================

  async exportTransactionsCSV(
    userId: string,
    filters: ExportTransactionsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const transactions = await this.getFilteredTransactions(userId, filters);

    const csvData = transactions.map((t) => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Description: t.description,
      Category: t.category?.name || 'Uncategorized',
      Tags: t.tags?.map((tag) => tag.name).join(', ') || '',
      Account: t.account?.name || '',
      Type: t.type,
      Amount: t.type === TransactionType.EXPENSE ? -Math.abs(Number(t.amount)) : Number(t.amount),
      Currency: t.currency,
      Notes: t.notes || '',
    }));

    const buffer = await this.generateCSV(csvData);
    const filename = this.generateFilename('transactions', 'csv', filters.startDate, filters.endDate);

    return { buffer, filename };
  }

  async exportTransactionsExcel(
    userId: string,
    filters: ExportTransactionsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const transactions = await this.getFilteredTransactions(userId, filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AI-Based FMS';
    workbook.created = new Date();

    // Transactions Sheet
    const transactionSheet = workbook.addWorksheet('Transactions');
    transactionSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Tags', key: 'tags', width: 20 },
      { header: 'Account', key: 'account', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];

    // Style header row
    transactionSheet.getRow(1).font = { bold: true };
    transactionSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4B5563' },
    };
    transactionSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    transactions.forEach((t) => {
      transactionSheet.addRow({
        date: format(new Date(t.date), 'yyyy-MM-dd'),
        description: t.description,
        category: t.category?.name || 'Uncategorized',
        tags: t.tags?.map((tag) => tag.name).join(', ') || '',
        account: t.account?.name || '',
        type: t.type,
        amount: t.type === TransactionType.EXPENSE ? -Math.abs(Number(t.amount)) : Number(t.amount),
        currency: t.currency,
        notes: t.notes || '',
      });
    });

    // Format amount column
    transactionSheet.getColumn('amount').numFmt = '#,##0.00';

    // Freeze first row
    transactionSheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Add filters
    transactionSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 9 },
    };

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4B5563' },
    };
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    summarySheet.addRow({ metric: 'Total Transactions', value: transactions.length });
    summarySheet.addRow({ metric: 'Total Income', value: totalIncome });
    summarySheet.addRow({ metric: 'Total Expense', value: totalExpense });
    summarySheet.addRow({ metric: 'Net Amount', value: totalIncome - totalExpense });

    summarySheet.getColumn('value').numFmt = '#,##0.00';

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = this.generateFilename('transactions', 'xlsx', filters.startDate, filters.endDate);

    return { buffer: Buffer.from(buffer), filename };
  }

  async exportTransactionsPDF(
    userId: string,
    filters: ExportTransactionsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const transactions = await this.getFilteredTransactions(userId, filters);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('Transaction Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, { align: 'center' });

    if (filters.startDate || filters.endDate) {
      const dateRange = `${filters.startDate || 'All'} to ${filters.endDate || 'All'}`;
      doc.text(`Date Range: ${dateRange}`, { align: 'center' });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Summary
    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Transactions: ${transactions.length}`);
    doc.text(`Total Income: $${totalIncome.toFixed(2)}`);
    doc.text(`Total Expense: $${totalExpense.toFixed(2)}`);
    doc.text(`Net Amount: $${(totalIncome - totalExpense).toFixed(2)}`);
    doc.moveDown();

    // Transactions Table
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemHeight = 20;
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    // Table Headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 50, tableTop, { width: 70 });
    doc.text('Description', 120, tableTop, { width: 120 });
    doc.text('Category', 240, tableTop, { width: 80 });
    doc.text('Type', 320, tableTop, { width: 60 });
    doc.text('Amount', 380, tableTop, { width: 80, align: 'right' });

    let y = tableTop + itemHeight;

    // Table Rows
    doc.font('Helvetica');
    transactions.slice(0, 100).forEach((transaction, i) => {
      // Check if we need a new page
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      const amount = transaction.type === TransactionType.EXPENSE
        ? -Math.abs(Number(transaction.amount))
        : Number(transaction.amount);

      doc.fontSize(8);
      doc.text(format(new Date(transaction.date), 'yyyy-MM-dd'), 50, y, { width: 70 });
      doc.text(transaction.description.substring(0, 20), 120, y, { width: 120 });
      doc.text(transaction.category?.name || 'N/A', 240, y, { width: 80 });
      doc.text(transaction.type, 320, y, { width: 60 });
      doc.text(`$${amount.toFixed(2)}`, 380, y, { width: 80, align: 'right' });

      y += itemHeight;
    });

    if (transactions.length > 100) {
      doc.moveDown();
      doc.fontSize(9).text(`Note: Showing first 100 of ${transactions.length} transactions`, { italics: true });
    }

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    const filename = this.generateFilename('transactions', 'pdf', filters.startDate, filters.endDate);

    return { buffer, filename };
  }

  // ==================== Budget Exports ====================

  async exportBudgetsCSV(
    userId: string,
    filters: ExportBudgetsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const budgets = await this.getFilteredBudgets(userId, filters);

    const csvData = budgets.map((b) => ({
      Name: b.name,
      Amount: Number(b.amount),
      Spent: Number(b.spent),
      Remaining: Number(b.amount) - Number(b.spent),
      PercentUsed: ((Number(b.spent) / Number(b.amount)) * 100).toFixed(2),
      Period: b.period,
      Type: b.type,
      StartDate: format(new Date(b.startDate), 'yyyy-MM-dd'),
      EndDate: format(new Date(b.endDate), 'yyyy-MM-dd'),
      Status: b.isActive ? 'Active' : 'Inactive',
    }));

    const buffer = await this.generateCSV(csvData);
    const filename = this.generateFilename('budgets', 'csv', filters.startDate, filters.endDate);

    return { buffer, filename };
  }

  async exportBudgetsExcel(
    userId: string,
    filters: ExportBudgetsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const budgets = await this.getFilteredBudgets(userId, filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AI-Based FMS';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Budgets');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Spent', key: 'spent', width: 12 },
      { header: 'Remaining', key: 'remaining', width: 12 },
      { header: 'Percent Used', key: 'percentUsed', width: 12 },
      { header: 'Period', key: 'period', width: 12 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Start Date', key: 'startDate', width: 12 },
      { header: 'End Date', key: 'endDate', width: 12 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4B5563' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    budgets.forEach((b) => {
      const spent = Number(b.spent);
      const amount = Number(b.amount);
      const remaining = amount - spent;
      const percentUsed = (spent / amount) * 100;

      sheet.addRow({
        name: b.name,
        amount: amount,
        spent: spent,
        remaining: remaining,
        percentUsed: percentUsed,
        period: b.period,
        type: b.type,
        startDate: format(new Date(b.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(b.endDate), 'yyyy-MM-dd'),
        status: b.isActive ? 'Active' : 'Inactive',
      });
    });

    // Format columns
    sheet.getColumn('amount').numFmt = '#,##0.00';
    sheet.getColumn('spent').numFmt = '#,##0.00';
    sheet.getColumn('remaining').numFmt = '#,##0.00';
    sheet.getColumn('percentUsed').numFmt = '0.00"%"';

    // Freeze first row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Add filters
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 10 },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = this.generateFilename('budgets', 'xlsx', filters.startDate, filters.endDate);

    return { buffer: Buffer.from(buffer), filename };
  }

  async exportBudgetsPDF(
    userId: string,
    filters: ExportBudgetsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const budgets = await this.getFilteredBudgets(userId, filters);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('Budget Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Summary
    const totalBudgeted = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
    const activeBudgets = budgets.filter((b) => b.isActive).length;

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Budgets: ${budgets.length}`);
    doc.text(`Active Budgets: ${activeBudgets}`);
    doc.text(`Total Budgeted: $${totalBudgeted.toFixed(2)}`);
    doc.text(`Total Spent: $${totalSpent.toFixed(2)}`);
    doc.text(`Total Remaining: $${(totalBudgeted - totalSpent).toFixed(2)}`);
    doc.moveDown();

    // Budgets Table
    doc.fontSize(14).text('Budgets', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemHeight = 25;
    const pageHeight = doc.page.height - doc.page.margins.bottom;

    // Table Headers
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Name', 50, tableTop, { width: 120 });
    doc.text('Amount', 170, tableTop, { width: 70, align: 'right' });
    doc.text('Spent', 240, tableTop, { width: 70, align: 'right' });
    doc.text('Remaining', 310, tableTop, { width: 70, align: 'right' });
    doc.text('Progress', 380, tableTop, { width: 70, align: 'right' });
    doc.text('Status', 450, tableTop, { width: 60 });

    let y = tableTop + itemHeight;

    // Table Rows
    doc.font('Helvetica');
    budgets.forEach((budget) => {
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 50;
      }

      const amount = Number(budget.amount);
      const spent = Number(budget.spent);
      const remaining = amount - spent;
      const progress = ((spent / amount) * 100).toFixed(1);

      doc.fontSize(8);
      doc.text(budget.name.substring(0, 25), 50, y, { width: 120 });
      doc.text(`$${amount.toFixed(2)}`, 170, y, { width: 70, align: 'right' });
      doc.text(`$${spent.toFixed(2)}`, 240, y, { width: 70, align: 'right' });
      doc.text(`$${remaining.toFixed(2)}`, 310, y, { width: 70, align: 'right' });
      doc.text(`${progress}%`, 380, y, { width: 70, align: 'right' });
      doc.text(budget.isActive ? 'Active' : 'Inactive', 450, y, { width: 60 });

      y += itemHeight;
    });

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    const filename = this.generateFilename('budgets', 'pdf', filters.startDate, filters.endDate);

    return { buffer, filename };
  }

  // ==================== Analytics Exports ====================

  async exportAnalyticsCSV(
    userId: string,
    filters: ExportAnalyticsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const analytics = await this.getAnalyticsData(userId, filters);

    const csvData = [];

    // Monthly summary
    csvData.push({ Section: 'Monthly Summary', Data: '' });
    analytics.monthlySummary.forEach((month) => {
      csvData.push({
        Month: month.month,
        Income: month.income,
        Expense: month.expense,
        Net: month.net,
      });
    });

    csvData.push({});

    // Category breakdown
    csvData.push({ Section: 'Category Breakdown', Data: '' });
    analytics.categoryBreakdown.forEach((cat) => {
      csvData.push({
        Category: cat.name,
        Amount: cat.amount,
        Percentage: cat.percentage,
        Count: cat.count,
      });
    });

    const buffer = await this.generateCSV(csvData);
    const filename = this.generateFilename('analytics', 'csv', filters.startDate, filters.endDate);

    return { buffer, filename };
  }

  async exportAnalyticsPDF(
    userId: string,
    filters: ExportAnalyticsDto,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const analytics = await this.getAnalyticsData(userId, filters);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, { align: 'center' });

    if (filters.startDate || filters.endDate) {
      const dateRange = `${filters.startDate || 'All'} to ${filters.endDate || 'All'}`;
      doc.text(`Date Range: ${dateRange}`, { align: 'center' });
    }

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Overview Summary
    doc.fontSize(14).text('Overview', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Income: $${analytics.totalIncome.toFixed(2)}`);
    doc.text(`Total Expense: $${analytics.totalExpense.toFixed(2)}`);
    doc.text(`Net Amount: $${(analytics.totalIncome - analytics.totalExpense).toFixed(2)}`);
    doc.text(`Savings Rate: ${analytics.savingsRate.toFixed(2)}%`);
    doc.moveDown();

    // Monthly Summary
    doc.fontSize(14).text('Monthly Summary', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemHeight = 20;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Month', 50, tableTop, { width: 100 });
    doc.text('Income', 150, tableTop, { width: 100, align: 'right' });
    doc.text('Expense', 250, tableTop, { width: 100, align: 'right' });
    doc.text('Net', 350, tableTop, { width: 100, align: 'right' });

    let y = tableTop + itemHeight;

    doc.font('Helvetica');
    analytics.monthlySummary.forEach((month) => {
      doc.fontSize(8);
      doc.text(month.month, 50, y, { width: 100 });
      doc.text(`$${month.income.toFixed(2)}`, 150, y, { width: 100, align: 'right' });
      doc.text(`$${month.expense.toFixed(2)}`, 250, y, { width: 100, align: 'right' });
      doc.text(`$${month.net.toFixed(2)}`, 350, y, { width: 100, align: 'right' });
      y += itemHeight;
    });

    doc.moveDown(2);

    // Category Breakdown
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }

    doc.fontSize(14).text('Category Breakdown', { underline: true });
    doc.moveDown(0.5);

    const catTableTop = doc.y;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Category', 50, catTableTop, { width: 150 });
    doc.text('Amount', 200, catTableTop, { width: 100, align: 'right' });
    doc.text('Percentage', 300, catTableTop, { width: 100, align: 'right' });
    doc.text('Transactions', 400, catTableTop, { width: 100, align: 'right' });

    y = catTableTop + itemHeight;

    doc.font('Helvetica');
    analytics.categoryBreakdown.slice(0, 15).forEach((cat) => {
      doc.fontSize(8);
      doc.text(cat.name, 50, y, { width: 150 });
      doc.text(`$${cat.amount.toFixed(2)}`, 200, y, { width: 100, align: 'right' });
      doc.text(`${cat.percentage.toFixed(1)}%`, 300, y, { width: 100, align: 'right' });
      doc.text(cat.count.toString(), 400, y, { width: 100, align: 'right' });
      y += itemHeight;
    });

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    const filename = this.generateFilename('analytics', 'pdf', filters.startDate, filters.endDate);

    return { buffer, filename };
  }

  // ==================== Account Exports ====================

  async exportAccountsCSV(userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const accounts = await this.accountRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });

    const csvData = accounts.map((a) => ({
      Name: a.name,
      Type: a.type,
      Balance: Number(a.balance),
      Currency: a.currency,
      Status: a.isActive ? 'Active' : 'Inactive',
      'Include in Total': a.includeInTotal ? 'Yes' : 'No',
      'Bank Name': a.bankName || '',
      'Account Number': a.accountNumber || '',
    }));

    const buffer = await this.generateCSV(csvData);
    const filename = this.generateFilename('accounts', 'csv');

    return { buffer, filename };
  }

  async exportAccountsPDF(userId: string): Promise<{ buffer: Buffer; filename: string }> {
    const accounts = await this.accountRepository.find({
      where: { userId },
      order: { name: 'ASC' },
    });

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).text('Accounts Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Summary
    const totalBalance = accounts
      .filter((a) => a.includeInTotal)
      .reduce((sum, a) => sum + Number(a.balance), 0);
    const activeAccounts = accounts.filter((a) => a.isActive).length;

    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10);
    doc.text(`Total Accounts: ${accounts.length}`);
    doc.text(`Active Accounts: ${activeAccounts}`);
    doc.text(`Total Balance: $${totalBalance.toFixed(2)}`);
    doc.moveDown();

    // Accounts Table
    doc.fontSize(14).text('Accounts', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemHeight = 20;

    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Name', 50, tableTop, { width: 120 });
    doc.text('Type', 170, tableTop, { width: 80 });
    doc.text('Balance', 250, tableTop, { width: 100, align: 'right' });
    doc.text('Currency', 350, tableTop, { width: 60 });
    doc.text('Status', 410, tableTop, { width: 60 });

    let y = tableTop + itemHeight;

    doc.font('Helvetica');
    accounts.forEach((account) => {
      doc.fontSize(8);
      doc.text(account.name, 50, y, { width: 120 });
      doc.text(account.type, 170, y, { width: 80 });
      doc.text(`$${Number(account.balance).toFixed(2)}`, 250, y, { width: 100, align: 'right' });
      doc.text(account.currency, 350, y, { width: 60 });
      doc.text(account.isActive ? 'Active' : 'Inactive', 410, y, { width: 60 });
      y += itemHeight;

      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
    });

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' },
      );
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    const filename = this.generateFilename('accounts', 'pdf');

    return { buffer, filename };
  }

  // ==================== Helper Methods ====================

  private async getFilteredTransactions(
    userId: string,
    filters: ExportTransactionsDto,
  ): Promise<Transaction[]> {
    const where: any = { userId, isDeleted: false };

    // Date range
    if (filters.startDate && filters.endDate) {
      where.date = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.date = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      where.date = LessThanOrEqual(filters.endDate);
    }

    // Type filter
    if (filters.type) {
      where.type = filters.type;
    }

    // Account filter
    if (filters.accountIds && filters.accountIds.length > 0) {
      where.accountId = In(filters.accountIds);
    }

    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      where.categoryId = In(filters.categoryIds);
    }

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.category', 'category')
      .leftJoinAndSelect('transaction.tags', 'tags')
      .where(where);

    // Search filter
    if (filters.search) {
      queryBuilder.andWhere('transaction.description ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    // Amount range
    if (filters.minAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', {
        minAmount: filters.minAmount,
      });
    }

    if (filters.maxAmount !== undefined) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: filters.maxAmount,
      });
    }

    // Tag filter
    if (filters.tagIds && filters.tagIds.length > 0) {
      queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds: filters.tagIds });
    }

    const transactions = await queryBuilder
      .orderBy('transaction.date', 'DESC')
      .limit(10000) // Reasonable limit
      .getMany();

    return transactions;
  }

  private async getFilteredBudgets(
    userId: string,
    filters: ExportBudgetsDto,
  ): Promise<Budget[]> {
    const where: any = { userId };

    // Date range
    if (filters.startDate && filters.endDate) {
      where.startDate = Between(filters.startDate, filters.endDate);
    }

    // Active only
    if (filters.activeOnly) {
      where.isActive = true;
    }

    const budgets = await this.budgetRepository.find({
      where,
      order: { name: 'ASC' },
    });

    // Filter exceeded budgets
    if (filters.exceededOnly) {
      return budgets.filter((b) => Number(b.spent) > Number(b.amount));
    }

    return budgets;
  }

  private async getAnalyticsData(userId: string, filters: ExportAnalyticsDto) {
    const where: any = { userId, isDeleted: false };

    if (filters.startDate && filters.endDate) {
      where.date = Between(filters.startDate, filters.endDate);
    }

    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['category'],
      order: { date: 'ASC' },
    });

    // Calculate monthly summary
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const monthKey = format(new Date(t.date), 'yyyy-MM');
      const existing = monthlyMap.get(monthKey) || { income: 0, expense: 0 };

      if (t.type === TransactionType.INCOME) {
        existing.income += Number(t.amount);
      } else if (t.type === TransactionType.EXPENSE) {
        existing.expense += Number(t.amount);
      }

      monthlyMap.set(monthKey, existing);
    });

    const monthlySummary = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));

    // Calculate category breakdown
    const categoryMap = new Map<string, { amount: number; count: number }>();

    transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        const catName = t.category?.name || 'Uncategorized';
        const existing = categoryMap.get(catName) || { amount: 0, count: 0 };
        existing.amount += Number(t.amount);
        existing.count += 1;
        categoryMap.set(catName, existing);
      });

    const totalExpense = Array.from(categoryMap.values()).reduce(
      (sum, cat) => sum + cat.amount,
      0,
    );

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percentage: (data.amount / totalExpense) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    const totalIncome = transactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenseCalc = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenseCalc) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpense: totalExpenseCalc,
      savingsRate,
      monthlySummary,
      categoryBreakdown,
    };
  }

  private async generateCSV(data: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = fastcsv.format({ headers: true, writeBOM: true });

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      data.forEach((row) => stream.write(row));
      stream.end();
    });
  }

  private generateFilename(
    type: string,
    format: string,
    startDate?: string,
    endDate?: string,
  ): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');

    if (startDate && endDate) {
      return `${type}_${startDate}_to_${endDate}.${format}`;
    } else if (startDate) {
      return `${type}_from_${startDate}.${format}`;
    } else if (endDate) {
      return `${type}_until_${endDate}.${format}`;
    }

    return `${type}_${timestamp}.${format}`;
  }
}
