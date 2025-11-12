import { Logger } from '@nestjs/common';
import { Job as BullJob } from 'bull';
import { JobMonitorService } from '../job-monitor.service';
import { JobType, JobLogLevel, JobProgress, JobResult, JobStatus } from '@database/entities';

/**
 * Base class for all job processors with monitoring capabilities
 */
export abstract class BaseJobProcessor {
  protected abstract readonly logger: Logger;
  protected abstract readonly jobType: JobType;

  constructor(protected readonly jobMonitorService: JobMonitorService) {}

  /**
   * Initialize job monitoring
   */
  protected async initializeJob(
    job: BullJob,
    queueName: string,
    userId?: string,
  ): Promise<void> {
    try {
      await this.jobMonitorService.createJob(job, queueName, this.jobType, userId);
      await this.jobMonitorService.updateJobStatus(
        job.id.toString(),
        JobStatus.WAITING,
      );
      await this.logInfo(job.id.toString(), `Job ${job.id} initialized`);
    } catch (error) {
      this.logger.error(`Failed to initialize job ${job.id}`, error.stack);
    }
  }

  /**
   * Mark job as active
   */
  protected async onJobActive(job: BullJob): Promise<void> {
    try {
      await this.jobMonitorService.updateJobStatus(
        job.id.toString(),
        JobStatus.ACTIVE,
      );
      await this.logInfo(job.id.toString(), `Job ${job.id} started processing`);
    } catch (error) {
      this.logger.error(`Failed to mark job ${job.id} as active`, error.stack);
    }
  }

  /**
   * Update job progress
   */
  protected async updateProgress(
    job: BullJob,
    progress: JobProgress,
  ): Promise<void> {
    try {
      await job.progress(progress.percentage);
      await this.jobMonitorService.updateJobProgress(job.id.toString(), progress);
      await this.logInfo(
        job.id.toString(),
        `Progress: ${progress.percentage}% - ${progress.message || progress.currentStep}`,
        { progress },
      );
    } catch (error) {
      this.logger.error(`Failed to update progress for job ${job.id}`, error.stack);
    }
  }

  /**
   * Mark job as completed
   */
  protected async onJobCompleted(job: BullJob, result: any): Promise<void> {
    try {
      const jobResult: JobResult = {
        success: true,
        data: result,
      };

      await this.jobMonitorService.updateJobStatus(
        job.id.toString(),
        JobStatus.COMPLETED,
      );
      await this.jobMonitorService.updateJobResult(job.id.toString(), jobResult);
      await this.logInfo(
        job.id.toString(),
        `Job ${job.id} completed successfully`,
        { result },
      );
    } catch (error) {
      this.logger.error(`Failed to mark job ${job.id} as completed`, error.stack);
    }
  }

  /**
   * Mark job as failed
   */
  protected async onJobFailed(job: BullJob, error: Error): Promise<void> {
    try {
      const jobResult: JobResult = {
        success: false,
        error: error.message,
      };

      await this.jobMonitorService.updateJobStatus(
        job.id.toString(),
        JobStatus.FAILED,
        {
          error: error.message,
          stackTrace: error.stack,
          attempts: job.attemptsMade,
        },
      );
      await this.jobMonitorService.updateJobResult(job.id.toString(), jobResult);
      await this.logError(
        job.id.toString(),
        `Job ${job.id} failed: ${error.message}`,
        { error: error.message },
        error.stack,
      );
    } catch (err) {
      this.logger.error(`Failed to mark job ${job.id} as failed`, err.stack);
    }
  }

  /**
   * Log info message
   */
  protected async logInfo(
    bullJobId: string,
    message: string,
    context?: Record<string, any>,
  ): Promise<void> {
    await this.jobMonitorService.logJobMessage(
      bullJobId,
      JobLogLevel.INFO,
      message,
      context,
    );
  }

  /**
   * Log warning message
   */
  protected async logWarning(
    bullJobId: string,
    message: string,
    context?: Record<string, any>,
  ): Promise<void> {
    await this.jobMonitorService.logJobMessage(
      bullJobId,
      JobLogLevel.WARNING,
      message,
      context,
    );
  }

  /**
   * Log error message
   */
  protected async logError(
    bullJobId: string,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string,
  ): Promise<void> {
    await this.jobMonitorService.logJobMessage(
      bullJobId,
      JobLogLevel.ERROR,
      message,
      context,
      stackTrace,
    );
  }

  /**
   * Log debug message
   */
  protected async logDebug(
    bullJobId: string,
    message: string,
    context?: Record<string, any>,
  ): Promise<void> {
    await this.jobMonitorService.logJobMessage(
      bullJobId,
      JobLogLevel.DEBUG,
      message,
      context,
    );
  }
}
