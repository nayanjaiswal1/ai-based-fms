import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job as BullJob } from 'bull';
import {
  Job,
  JobLog,
  JobStatus,
  JobPriority,
  JobType,
  JobLogLevel,
  JobProgress,
  JobResult,
} from '@database/entities';
import { JobQueryDto, CleanJobsDto } from './dto';

@Injectable()
export class JobMonitorService {
  private readonly logger = new Logger(JobMonitorService.name);

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(JobLog)
    private jobLogRepository: Repository<JobLog>,
  ) {}

  /**
   * Create a new job record
   */
  async createJob(
    bullJob: BullJob,
    queueName: string,
    type: JobType,
    userId?: string,
  ): Promise<Job> {
    const job = this.jobRepository.create({
      bullJobId: bullJob.id.toString(),
      queueName,
      type,
      status: JobStatus.WAITING,
      priority: bullJob.opts.priority || JobPriority.NORMAL,
      data: bullJob.data,
      userId,
      maxAttempts: bullJob.opts.attempts || 3,
      timeout: bullJob.opts.timeout,
    });

    return await this.jobRepository.save(job);
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    bullJobId: string,
    status: JobStatus,
    data?: Partial<Job>,
  ): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { bullJobId } });
    if (!job) {
      this.logger.warn(`Job with bullJobId ${bullJobId} not found`);
      return null;
    }

    Object.assign(job, data, { status });

    if (status === JobStatus.ACTIVE && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (status === JobStatus.COMPLETED) {
      job.completedAt = new Date();
      if (job.startedAt) {
        job.duration = Date.now() - job.startedAt.getTime();
      }
    }

    if (status === JobStatus.FAILED) {
      job.failedAt = new Date();
      if (job.startedAt) {
        job.duration = Date.now() - job.startedAt.getTime();
      }
    }

    return await this.jobRepository.save(job);
  }

  /**
   * Update job progress
   */
  async updateJobProgress(
    bullJobId: string,
    progress: JobProgress,
  ): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { bullJobId } });
    if (!job) {
      return null;
    }

    job.progress = progress;
    return await this.jobRepository.save(job);
  }

  /**
   * Update job result
   */
  async updateJobResult(
    bullJobId: string,
    result: JobResult,
  ): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { bullJobId } });
    if (!job) {
      return null;
    }

    job.result = result;
    return await this.jobRepository.save(job);
  }

  /**
   * Log job message
   */
  async logJobMessage(
    bullJobId: string,
    level: JobLogLevel,
    message: string,
    context?: Record<string, any>,
    stackTrace?: string,
  ): Promise<void> {
    const job = await this.jobRepository.findOne({ where: { bullJobId } });
    if (!job) {
      return;
    }

    const log = this.jobLogRepository.create({
      jobId: job.id,
      level,
      message,
      context,
      stackTrace,
    });

    await this.jobLogRepository.save(log);
  }

  /**
   * Get jobs with filtering and pagination
   */
  async getJobs(query: JobQueryDto) {
    const {
      status,
      type,
      queueName,
      userId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (status) {
      queryBuilder.andWhere('job.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('job.type = :type', { type });
    }

    if (queueName) {
      queryBuilder.andWhere('job.queueName = :queueName', { queueName });
    }

    if (userId) {
      queryBuilder.andWhere('job.userId = :userId', { userId });
    }

    queryBuilder
      .orderBy(`job.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [jobs, total] = await queryBuilder.getManyAndCount();

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get job by ID
   */
  async getJobById(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: ['logs'],
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  /**
   * Get job by Bull job ID
   */
  async getJobByBullId(bullJobId: string): Promise<Job> {
    return await this.jobRepository.findOne({
      where: { bullJobId },
      relations: ['logs'],
    });
  }

  /**
   * Get job logs
   */
  async getJobLogs(jobId: string, limit = 100): Promise<JobLog[]> {
    return await this.jobLogRepository.find({
      where: { jobId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get job statistics
   */
  async getJobStatistics(userId?: string) {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (userId) {
      queryBuilder.where('job.userId = :userId', { userId });
    }

    const [
      total,
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().where('job.status = :status', { status: JobStatus.WAITING }).getCount(),
      queryBuilder.clone().where('job.status = :status', { status: JobStatus.ACTIVE }).getCount(),
      queryBuilder.clone().where('job.status = :status', { status: JobStatus.COMPLETED }).getCount(),
      queryBuilder.clone().where('job.status = :status', { status: JobStatus.FAILED }).getCount(),
      queryBuilder.clone().where('job.status = :status', { status: JobStatus.DELAYED }).getCount(),
      queryBuilder.clone().where('job.status = :status', { status: JobStatus.PAUSED }).getCount(),
    ]);

    // Calculate success rate
    const totalProcessed = completed + failed;
    const successRate = totalProcessed > 0 ? (completed / totalProcessed) * 100 : 0;

    // Calculate average duration for completed jobs
    const avgDurationResult = await this.jobRepository
      .createQueryBuilder('job')
      .select('AVG(job.duration)', 'avgDuration')
      .where('job.status = :status', { status: JobStatus.COMPLETED })
      .andWhere('job.duration > 0')
      .getRawOne();

    const avgDuration = avgDurationResult?.avgDuration || 0;

    // Get stats by type
    const statsByType = await this.jobRepository
      .createQueryBuilder('job')
      .select('job.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(CASE WHEN job.status = :completed THEN 1 ELSE 0 END)', 'completed')
      .addSelect('SUM(CASE WHEN job.status = :failed THEN 1 ELSE 0 END)', 'failed')
      .addSelect('AVG(CASE WHEN job.status = :completed THEN job.duration ELSE NULL END)', 'avgDuration')
      .setParameter('completed', JobStatus.COMPLETED)
      .setParameter('failed', JobStatus.FAILED)
      .groupBy('job.type')
      .getRawMany();

    return {
      total,
      byStatus: {
        waiting,
        active,
        completed,
        failed,
        delayed,
        paused,
      },
      successRate: Math.round(successRate * 100) / 100,
      avgDuration: Math.round(avgDuration),
      byType: statsByType.map((stat) => ({
        type: stat.type,
        count: parseInt(stat.count),
        completed: parseInt(stat.completed),
        failed: parseInt(stat.failed),
        avgDuration: Math.round(stat.avgDuration || 0),
      })),
    };
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(dto: CleanJobsDto): Promise<number> {
    const { status, olderThanDays = 30, limit } = dto;

    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    const queryBuilder = this.jobRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date });

    if (status) {
      queryBuilder.andWhere('status = :status', { status });
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    const result = await queryBuilder.execute();
    this.logger.log(`Cleaned ${result.affected} old jobs`);

    return result.affected || 0;
  }

  /**
   * Delete job
   */
  async deleteJob(id: string): Promise<void> {
    const job = await this.getJobById(id);
    await this.jobRepository.remove(job);
  }

  /**
   * Check for stuck jobs and mark them
   */
  async checkStuckJobs(): Promise<number> {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - 30); // Jobs stuck for more than 30 minutes

    const stuckJobs = await this.jobRepository
      .createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.ACTIVE })
      .andWhere('job.startedAt < :threshold', { threshold })
      .getMany();

    for (const job of stuckJobs) {
      job.status = JobStatus.STUCK;
      await this.jobRepository.save(job);
      this.logger.warn(`Marked job ${job.id} as stuck`);
    }

    return stuckJobs.length;
  }

  /**
   * Get recent failed jobs for notifications
   */
  async getRecentFailedJobs(minutes: number = 60): Promise<Job[]> {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - minutes);

    return await this.jobRepository.find({
      where: {
        status: JobStatus.FAILED,
        failedAt: LessThan(threshold),
      },
      order: { failedAt: 'DESC' },
    });
  }
}
