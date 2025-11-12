import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Report, ReportScheduleFrequency } from '@database/entities/report.entity';
import { GeneratedReport, ReportFormat, GeneratedReportStatus } from '@database/entities/generated-report.entity';
import { ReportGeneratorService } from './report-generator.service';
import { ReportExportService } from './report-export.service';

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(GeneratedReport)
    private generatedReportRepository: Repository<GeneratedReport>,
    @InjectQueue('reports')
    private reportQueue: Queue,
    private reportGeneratorService: ReportGeneratorService,
    private reportExportService: ReportExportService,
  ) {}

  // Check for scheduled reports every hour
  @Cron(CronExpression.EVERY_HOUR)
  async checkScheduledReports() {
    this.logger.log('Checking for scheduled reports...');

    const now = new Date();

    // Find reports with active schedules
    const scheduledReports = await this.reportRepository
      .createQueryBuilder('report')
      .where("report.schedule->>'enabled' = 'true'")
      .andWhere(
        `(report.schedule->>'nextRun' IS NULL OR report.schedule->>'nextRun' <= :now)`,
        { now: now.toISOString() },
      )
      .getMany();

    this.logger.log(`Found ${scheduledReports.length} reports to generate`);

    for (const report of scheduledReports) {
      await this.scheduleReportGeneration(report);
    }
  }

  async scheduleReportGeneration(report: Report): Promise<void> {
    this.logger.log(`Scheduling report generation for report: ${report.id}`);

    // Add job to queue
    await this.reportQueue.add(
      'generate-scheduled-report',
      {
        reportId: report.id,
        userId: report.userId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    // Update last run and calculate next run
    const schedule = report.schedule;
    schedule.lastRun = new Date();
    schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule);

    await this.reportRepository.update(report.id, {
      schedule,
      lastRunAt: new Date(),
    });
  }

  private calculateNextRun(
    frequency: ReportScheduleFrequency,
    schedule: any,
  ): Date {
    const now = new Date();

    switch (frequency) {
      case ReportScheduleFrequency.DAILY:
        const dailyNext = new Date(now);
        dailyNext.setDate(dailyNext.getDate() + 1);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          dailyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return dailyNext;

      case ReportScheduleFrequency.WEEKLY:
        const weeklyNext = new Date(now);
        const currentDay = weeklyNext.getDay();
        const targetDay = schedule.dayOfWeek || 1; // Default to Monday
        const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
        weeklyNext.setDate(weeklyNext.getDate() + daysUntilTarget);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          weeklyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return weeklyNext;

      case ReportScheduleFrequency.MONTHLY:
        const monthlyNext = new Date(now);
        monthlyNext.setMonth(monthlyNext.getMonth() + 1);
        if (schedule.dayOfMonth) {
          monthlyNext.setDate(Math.min(schedule.dayOfMonth, 28)); // Avoid invalid dates
        } else {
          monthlyNext.setDate(1);
        }
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          monthlyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return monthlyNext;

      case ReportScheduleFrequency.QUARTERLY:
        const quarterlyNext = new Date(now);
        quarterlyNext.setMonth(quarterlyNext.getMonth() + 3);
        quarterlyNext.setDate(1);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          quarterlyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return quarterlyNext;

      case ReportScheduleFrequency.YEARLY:
        const yearlyNext = new Date(now);
        yearlyNext.setFullYear(yearlyNext.getFullYear() + 1);
        yearlyNext.setMonth(0);
        yearlyNext.setDate(1);
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':');
          yearlyNext.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
        return yearlyNext;

      default:
        return now;
    }
  }

  async processScheduledReport(reportId: string, userId: string): Promise<void> {
    this.logger.log(`Processing scheduled report: ${reportId}`);

    try {
      const report = await this.reportRepository.findOne({
        where: { id: reportId, userId },
      });

      if (!report) {
        throw new Error(`Report not found: ${reportId}`);
      }

      // Generate report data
      const reportData = await this.reportGeneratorService.generateReportData(report, userId);

      // Determine format (default to PDF for scheduled reports)
      const format = ReportFormat.PDF;

      // Create generated report record
      const generatedReport = this.generatedReportRepository.create({
        reportId: report.id,
        format,
        status: GeneratedReportStatus.GENERATING,
        generatedBy: userId,
      });

      await this.generatedReportRepository.save(generatedReport);

      // Export report
      const exportResult = await this.reportExportService.exportReport(
        report,
        reportData,
        format,
      );

      // Update generated report record
      generatedReport.status = GeneratedReportStatus.COMPLETED;
      generatedReport.fileUrl = exportResult.filePath;
      generatedReport.fileName = exportResult.fileName;
      generatedReport.fileSize = exportResult.fileSize;
      generatedReport.metadata = {
        summary: reportData.summary,
        recordCount: reportData.metadata.recordCount,
      };

      // Set expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      generatedReport.expiresAt = expiresAt;

      await this.generatedReportRepository.save(generatedReport);

      // Update report run count
      await this.reportRepository.increment({ id: report.id }, 'runCount', 1);

      // Send email if configured
      if (report.schedule?.emailRecipients?.length > 0) {
        this.logger.log(`Sending report to ${report.schedule.emailRecipients.length} recipients`);
        // TODO: Integrate with email service to send report
      }

      this.logger.log(`Successfully generated scheduled report: ${reportId}`);
    } catch (error) {
      this.logger.error(`Failed to process scheduled report: ${reportId}`, error);
      throw error;
    }
  }

  // Clean up expired reports daily
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredReports() {
    this.logger.log('Cleaning up expired reports...');

    const now = new Date();

    const expiredReports = await this.generatedReportRepository
      .createQueryBuilder('generatedReport')
      .where('generatedReport.expiresAt < :now', { now })
      .getMany();

    this.logger.log(`Found ${expiredReports.length} expired reports`);

    for (const report of expiredReports) {
      try {
        // Delete file
        if (report.fileUrl) {
          await this.reportExportService.deleteReportFile(report.fileUrl);
        }

        // Delete database record
        await this.generatedReportRepository.remove(report);

        this.logger.log(`Deleted expired report: ${report.id}`);
      } catch (error) {
        this.logger.error(`Failed to delete expired report: ${report.id}`, error);
      }
    }
  }

  async updateSchedule(reportId: string, schedule: any): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    // Calculate next run
    if (schedule.enabled && schedule.frequency !== ReportScheduleFrequency.NONE) {
      schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule);
    } else {
      schedule.nextRun = null;
    }

    await this.reportRepository.update(reportId, { schedule });

    this.logger.log(`Updated schedule for report: ${reportId}`);
  }
}
