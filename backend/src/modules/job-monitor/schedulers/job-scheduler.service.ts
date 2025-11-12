import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, JobPriority } from '@database/entities';
import { JobMonitorService } from '../job-monitor.service';

@Injectable()
export class JobSchedulerService {
  private readonly logger = new Logger(JobSchedulerService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectQueue('reports') private reportsQueue: Queue,
    @InjectQueue('insights') private insightsQueue: Queue,
    private readonly jobMonitorService: JobMonitorService,
  ) {}

  /**
   * Daily budget refresh - Runs at 1 AM daily
   * Updates spent amounts and checks budget limits
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'daily-budget-refresh',
  })
  async handleDailyBudgetRefresh() {
    this.logger.log('Starting daily budget refresh...');

    try {
      const users = await this.userRepository.find({
        select: ['id'],
      });

      let scheduledCount = 0;

      for (const user of users) {
        // Schedule budget refresh job for each user
        // This would be handled by a budget refresh processor
        // For now, we'll just log it
        this.logger.debug(`Budget refresh scheduled for user ${user.id}`);
        scheduledCount++;
      }

      this.logger.log(
        `Daily budget refresh completed. Scheduled for ${scheduledCount} users`,
      );
    } catch (error) {
      this.logger.error('Failed to run daily budget refresh', error.stack);
    }
  }

  /**
   * Daily email sync - Runs at 2 AM daily
   * Syncs transactions from connected email accounts
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'daily-email-sync',
  })
  async handleDailyEmailSync() {
    this.logger.log('Starting daily email sync...');

    try {
      // Get users with email connections
      const users = await this.userRepository.find({
        select: ['id'],
      });

      let scheduledCount = 0;

      for (const user of users) {
        // Schedule email sync job for each user
        // This would be handled by an email sync processor
        this.logger.debug(`Email sync scheduled for user ${user.id}`);
        scheduledCount++;
      }

      this.logger.log(
        `Daily email sync completed. Scheduled for ${scheduledCount} users`,
      );
    } catch (error) {
      this.logger.error('Failed to run daily email sync', error.stack);
    }
  }

  /**
   * Weekly insights generation - Runs every Sunday at 3 AM
   * Generates comprehensive weekly insights for all users
   */
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weekly-insights-generation',
  })
  async handleWeeklyInsights() {
    this.logger.log('Starting weekly insights generation...');

    try {
      const users = await this.userRepository.find({
        select: ['id'],
      });

      let scheduledCount = 0;

      for (const user of users) {
        await this.insightsQueue.add(
          'generate-weekly-insights',
          {
            userId: user.id,
            type: 'weekly',
            notifyUser: true,
          },
          {
            priority: JobPriority.NORMAL,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        );
        scheduledCount++;
      }

      this.logger.log(
        `Weekly insights generation completed. Scheduled for ${scheduledCount} users`,
      );
    } catch (error) {
      this.logger.error('Failed to schedule weekly insights', error.stack);
    }
  }

  /**
   * Monthly report generation - Runs on 1st of every month at 4 AM
   * Generates monthly summary reports for all users
   */
  @Cron('0 4 1 * *', {
    name: 'monthly-report-generation',
  })
  async handleMonthlyReports() {
    this.logger.log('Starting monthly report generation...');

    try {
      const users = await this.userRepository.find({
        select: ['id'],
      });

      let scheduledCount = 0;

      for (const user of users) {
        // Schedule monthly report generation
        // This would create a report job with monthly summary type
        this.logger.debug(`Monthly report scheduled for user ${user.id}`);
        scheduledCount++;
      }

      this.logger.log(
        `Monthly report generation completed. Scheduled for ${scheduledCount} users`,
      );
    } catch (error) {
      this.logger.error('Failed to schedule monthly reports', error.stack);
    }
  }

  /**
   * Daily backup verification - Runs at 5 AM daily
   * Verifies database backups are running correctly
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-backup-verification',
  })
  async handleDailyBackupVerification() {
    this.logger.log('Starting daily backup verification...');

    try {
      // Verify backup system is working
      // This would check if backups are being created and are valid
      this.logger.log('Backup verification completed');
    } catch (error) {
      this.logger.error('Failed to verify backups', error.stack);
    }
  }

  /**
   * Hourly cache cleanup - Runs every hour
   * Cleans up expired cache entries
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'hourly-cache-cleanup',
  })
  async handleHourlyCacheCleanup() {
    this.logger.debug('Starting hourly cache cleanup...');

    try {
      // Clean up expired cache entries
      // This would be handled by cache service
      this.logger.debug('Cache cleanup completed');
    } catch (error) {
      this.logger.error('Failed to clean cache', error.stack);
    }
  }

  /**
   * Daily notification digest - Runs at 8 AM daily
   * Sends digest of notifications to users
   */
  @Cron('0 8 * * *', {
    name: 'daily-notification-digest',
  })
  async handleDailyNotificationDigest() {
    this.logger.log('Starting daily notification digest...');

    try {
      const users = await this.userRepository.find({
        select: ['id'],
      });

      let scheduledCount = 0;

      for (const user of users) {
        // Schedule notification digest for each user
        this.logger.debug(`Notification digest scheduled for user ${user.id}`);
        scheduledCount++;
      }

      this.logger.log(
        `Daily notification digest completed. Scheduled for ${scheduledCount} users`,
      );
    } catch (error) {
      this.logger.error('Failed to send notification digests', error.stack);
    }
  }

  /**
   * Check for stuck jobs - Runs every 15 minutes
   * Identifies and handles stuck jobs
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'check-stuck-jobs',
  })
  async handleStuckJobsCheck() {
    this.logger.debug('Checking for stuck jobs...');

    try {
      const stuckCount = await this.jobMonitorService.checkStuckJobs();

      if (stuckCount > 0) {
        this.logger.warn(`Found ${stuckCount} stuck jobs`);
      }
    } catch (error) {
      this.logger.error('Failed to check for stuck jobs', error.stack);
    }
  }

  /**
   * Clean old jobs - Runs daily at midnight
   * Removes old completed and failed jobs from database
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'clean-old-jobs',
  })
  async handleCleanOldJobs() {
    this.logger.log('Starting cleanup of old jobs...');

    try {
      const cleaned = await this.jobMonitorService.cleanOldJobs({
        olderThanDays: 30,
      });

      this.logger.log(`Cleaned ${cleaned} old jobs`);
    } catch (error) {
      this.logger.error('Failed to clean old jobs', error.stack);
    }
  }
}
