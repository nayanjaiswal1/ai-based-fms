import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightType } from './dto/insights-options.dto';

export interface InsightsJobData {
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  notifyUser?: boolean;
}

@Processor('insights')
export class InsightsProcessor {
  private readonly logger = new Logger(InsightsProcessor.name);

  constructor(private readonly insightsService: InsightsService) {}

  @Process('generate-daily-insights')
  async handleDailyInsights(job: Job<InsightsJobData>) {
    this.logger.log(`Processing daily insights for user: ${job.data.userId}`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    try {
      // Generate insights for the past day
      const insights = await this.insightsService.generateInsights(job.data.userId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        types: [InsightType.SPENDING, InsightType.BUDGET, InsightType.ANOMALY],
        useAI: true,
      });

      // Log important insights that should notify user
      const importantInsights = insights.insights.filter(
        (i) => i.severity === 'warning' || i.severity === 'error',
      );

      if (importantInsights.length > 0) {
        this.logger.log(
          `Found ${importantInsights.length} important insights for user ${job.data.userId}`,
        );
        // TODO: Integrate with notifications module to send alerts
      }

      return {
        success: true,
        insightsGenerated: insights.insights.length,
        importantInsights: importantInsights.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate daily insights for user ${job.data.userId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('generate-weekly-insights')
  async handleWeeklyInsights(job: Job<InsightsJobData>) {
    this.logger.log(`Processing weekly insights for user: ${job.data.userId}`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    try {
      // Generate comprehensive insights for the past week
      const insights = await this.insightsService.generateInsights(job.data.userId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        types: [
          InsightType.SPENDING,
          InsightType.BUDGET,
          InsightType.SAVINGS,
          InsightType.TREND,
          InsightType.ANOMALY,
        ],
        useAI: true,
      });

      this.logger.log(
        `Generated ${insights.insights.length} weekly insights for user ${job.data.userId}`,
      );

      return {
        success: true,
        insightsGenerated: insights.insights.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate weekly insights for user ${job.data.userId}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('generate-monthly-insights')
  async handleMonthlyInsights(job: Job<InsightsJobData>) {
    this.logger.log(`Processing monthly insights for user: ${job.data.userId}`);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    try {
      // Generate full comprehensive insights including predictions
      const insights = await this.insightsService.generateInsights(job.data.userId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        types: Object.values(InsightType),
        useAI: true,
        includePredictions: true,
      });

      this.logger.log(
        `Generated ${insights.insights.length} monthly insights for user ${job.data.userId}`,
      );

      // This is a good time to calculate financial health
      const healthScore = await this.insightsService.getFinancialHealth(job.data.userId);
      this.logger.log(
        `Financial health score for user ${job.data.userId}: ${healthScore.score}/100 (${healthScore.status})`,
      );

      return {
        success: true,
        insightsGenerated: insights.insights.length,
        healthScore: healthScore.score,
        healthStatus: healthScore.status,
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate monthly insights for user ${job.data.userId}`,
        error.stack,
      );
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job<InsightsJobData>) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name} for user ${job.data.userId}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job<InsightsJobData>, result: any) {
    this.logger.log(`Completed job ${job.id} of type ${job.name} for user ${job.data.userId}`);
    this.logger.debug(`Result: ${JSON.stringify(result)}`);
  }

  @OnQueueFailed()
  onError(job: Job<InsightsJobData>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name} for user ${job.data.userId}`,
      error.stack,
    );
  }
}
