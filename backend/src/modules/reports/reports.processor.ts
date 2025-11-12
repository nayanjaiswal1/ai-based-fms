import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportSchedulerService } from './services/report-scheduler.service';

@Processor('reports')
export class ReportsProcessor {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    private reportsService: ReportsService,
    private reportSchedulerService: ReportSchedulerService,
  ) {}

  @Process('generate-report')
  async handleGenerateReport(job: Job) {
    this.logger.log(`Processing report generation job: ${job.id}`);

    try {
      await this.reportsService.processReportGeneration(job.data);
      this.logger.log(`Successfully completed report generation job: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process report generation job: ${job.id}`, error);
      throw error;
    }
  }

  @Process('generate-scheduled-report')
  async handleScheduledReport(job: Job) {
    this.logger.log(`Processing scheduled report job: ${job.id}`);

    try {
      const { reportId, userId } = job.data;
      await this.reportSchedulerService.processScheduledReport(reportId, userId);
      this.logger.log(`Successfully completed scheduled report job: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process scheduled report job: ${job.id}`, error);
      throw error;
    }
  }
}
