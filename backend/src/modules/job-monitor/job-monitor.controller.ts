import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@database/entities';
import { JobMonitorService } from './job-monitor.service';
import {
  JobQueryDto,
  RetryJobDto,
  QueueControlDto,
  CleanJobsDto,
  QueueAction,
} from './dto';

@Controller('job-monitor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class JobMonitorController {
  constructor(
    private readonly jobMonitorService: JobMonitorService,
    @InjectQueue('reports') private reportsQueue: Queue,
    @InjectQueue('insights') private insightsQueue: Queue,
  ) {}

  /**
   * Get jobs with filtering and pagination
   */
  @Get('jobs')
  async getJobs(@Query() query: JobQueryDto) {
    return await this.jobMonitorService.getJobs(query);
  }

  /**
   * Get job by ID
   */
  @Get('jobs/:id')
  async getJobById(@Param('id') id: string) {
    return await this.jobMonitorService.getJobById(id);
  }

  /**
   * Get job logs
   */
  @Get('jobs/:id/logs')
  async getJobLogs(@Param('id') id: string) {
    return await this.jobMonitorService.getJobLogs(id);
  }

  /**
   * Get job statistics
   */
  @Get('statistics')
  async getStatistics() {
    return await this.jobMonitorService.getJobStatistics();
  }

  /**
   * Retry a failed job
   */
  @Post('jobs/:id/retry')
  @HttpCode(HttpStatus.OK)
  async retryJob(@Param('id') id: string, @Body() dto: RetryJobDto) {
    const job = await this.jobMonitorService.getJobById(id);
    const queue = this.getQueue(job.queueName);

    if (!queue) {
      throw new Error(`Queue ${job.queueName} not found`);
    }

    const bullJob = await queue.getJob(job.bullJobId);
    if (!bullJob) {
      throw new Error(`Bull job ${job.bullJobId} not found in queue`);
    }

    if (dto.resetAttempts) {
      await bullJob.retry();
    } else {
      // Retry without resetting attempts
      await bullJob.retry();
    }

    await this.jobMonitorService.updateJobStatus(
      job.bullJobId,
      'waiting' as any,
      {
        attempts: dto.resetAttempts ? 0 : job.attempts,
      },
    );

    return { success: true, message: 'Job retried successfully' };
  }

  /**
   * Cancel a running or waiting job
   */
  @Delete('jobs/:id')
  async cancelJob(@Param('id') id: string) {
    const job = await this.jobMonitorService.getJobById(id);
    const queue = this.getQueue(job.queueName);

    if (!queue) {
      throw new Error(`Queue ${job.queueName} not found`);
    }

    const bullJob = await queue.getJob(job.bullJobId);
    if (bullJob) {
      await bullJob.remove();
    }

    await this.jobMonitorService.deleteJob(id);

    return { success: true, message: 'Job cancelled successfully' };
  }

  /**
   * Get queue status
   */
  @Get('queues/:queueName/status')
  async getQueueStatus(@Param('queueName') queueName: string) {
    const queue = this.getQueue(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      isPaused,
    ] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.getPausedCount(),
      queue.isPaused(),
    ]);

    return {
      queueName,
      isPaused,
      counts: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused,
      },
    };
  }

  /**
   * Control queue (pause, resume, clean, drain)
   */
  @Post('queues/:queueName/control')
  @HttpCode(HttpStatus.OK)
  async controlQueue(
    @Param('queueName') queueName: string,
    @Body() dto: QueueControlDto,
  ) {
    const queue = this.getQueue(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    switch (dto.action) {
      case QueueAction.PAUSE:
        await queue.pause(true, dto.grace);
        return { success: true, message: 'Queue paused' };

      case QueueAction.RESUME:
        await queue.resume();
        return { success: true, message: 'Queue resumed' };

      case QueueAction.CLEAN:
        // Clean completed and failed jobs
        const [completedRemoved, failedRemoved] = await Promise.all([
          queue.clean(dto.grace || 0, 'completed'),
          queue.clean(dto.grace || 0, 'failed'),
        ]);
        return {
          success: true,
          message: `Cleaned ${completedRemoved.length + failedRemoved.length} jobs`,
        };

      case QueueAction.DRAIN:
        await queue.drain(dto.grace !== undefined);
        return { success: true, message: 'Queue drained' };

      default:
        throw new Error(`Unknown action: ${dto.action}`);
    }
  }

  /**
   * Clean old jobs from database
   */
  @Post('jobs/clean')
  @HttpCode(HttpStatus.OK)
  async cleanJobs(@Body() dto: CleanJobsDto) {
    const count = await this.jobMonitorService.cleanOldJobs(dto);
    return { success: true, message: `Cleaned ${count} jobs` };
  }

  /**
   * Check for stuck jobs
   */
  @Post('jobs/check-stuck')
  @HttpCode(HttpStatus.OK)
  async checkStuckJobs() {
    const count = await this.jobMonitorService.checkStuckJobs();
    return { success: true, message: `Found ${count} stuck jobs` };
  }

  /**
   * Get available queues
   */
  @Get('queues')
  async getQueues() {
    return {
      queues: [
        { name: 'reports', description: 'Report generation jobs' },
        { name: 'insights', description: 'Insights generation jobs' },
      ],
    };
  }

  /**
   * Helper method to get queue by name
   */
  private getQueue(queueName: string): Queue | null {
    switch (queueName) {
      case 'reports':
        return this.reportsQueue;
      case 'insights':
        return this.insightsQueue;
      default:
        return null;
    }
  }
}
