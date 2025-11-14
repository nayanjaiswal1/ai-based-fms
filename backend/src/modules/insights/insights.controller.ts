import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { InsightsService } from './insights.service';
import { InsightsOptionsDto } from './dto/insights-options.dto';
import { InsightsResponseDto } from './dto/insights-response.dto';

@ApiTags('insights')
@Controller('insights')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all insights for the user' })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive financial insights',
  })
  async getAllInsights(
    @Request() req,
    @Query() options: InsightsOptionsDto,
  ): Promise<InsightsResponseDto> {
    return this.insightsService.generateInsights(req.user.userId, options);
  }

  @Get('spending')
  @ApiOperation({ summary: 'Get spending pattern insights' })
  @ApiResponse({
    status: 200,
    description: 'Returns spending pattern insights',
  })
  async getSpendingInsights(@Request() req, @Query() options: InsightsOptionsDto) {
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const startDate = options.startDate
      ? new Date(options.startDate)
      : new Date(new Date().setMonth(endDate.getMonth() - 1));

    const insights = await this.insightsService.getSpendingInsights(
      req.user.userId,
      startDate,
      endDate,
    );

    return {
      insights,
      count: insights.length,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    };
  }

  @Get('budget')
  @ApiOperation({ summary: 'Get budget performance insights' })
  @ApiResponse({
    status: 200,
    description: 'Returns budget performance insights',
  })
  async getBudgetInsights(@Request() req) {
    const insights = await this.insightsService.getBudgetInsights(req.user.userId);

    return {
      insights,
      count: insights.length,
    };
  }

  @Get('savings')
  @ApiOperation({ summary: 'Get savings opportunities' })
  @ApiResponse({
    status: 200,
    description: 'Returns savings opportunities and insights',
  })
  async getSavingsOpportunities(@Request() req, @Query() options: InsightsOptionsDto) {
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const startDate = options.startDate
      ? new Date(options.startDate)
      : new Date(new Date().setMonth(endDate.getMonth() - 1));

    const [insights, opportunities] = await Promise.all([
      this.insightsService.getSavingsInsights(req.user.userId, startDate, endDate),
      this.insightsService.getSavingsOpportunities(req.user.userId, startDate, endDate),
    ]);

    return {
      insights,
      opportunities,
      totalPotentialSavings: opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0),
      count: {
        insights: insights.length,
        opportunities: opportunities.length,
      },
    };
  }

  @Get('anomalies')
  @ApiOperation({ summary: 'Get anomaly detections and unusual patterns' })
  @ApiResponse({
    status: 200,
    description: 'Returns detected anomalies',
  })
  async getAnomalies(@Request() req, @Query() options: InsightsOptionsDto) {
    const endDate = options.endDate ? new Date(options.endDate) : new Date();
    const startDate = options.startDate
      ? new Date(options.startDate)
      : new Date(new Date().setMonth(endDate.getMonth() - 1));

    const insights = await this.insightsService.getAnomalyDetection(
      req.user.userId,
      startDate,
      endDate,
    );

    return {
      anomalies: insights,
      count: insights.length,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get category-wise spending trends' })
  @ApiResponse({
    status: 200,
    description: 'Returns category spending trends',
  })
  async getCategoryTrends(@Request() req) {
    const [trends, insights] = await Promise.all([
      this.insightsService.getCategoryTrends(req.user.userId),
      this.insightsService.getCategoryTrendsInsights(req.user.userId),
    ]);

    return {
      trends,
      insights,
      count: {
        trends: trends.length,
        insights: insights.length,
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Get financial health score and breakdown' })
  @ApiResponse({
    status: 200,
    description: 'Returns financial health score with detailed breakdown',
  })
  async getFinancialHealth(@Request() req) {
    return this.insightsService.getFinancialHealth(req.user.userId);
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get future spending predictions' })
  @ApiResponse({
    status: 200,
    description: 'Returns predictions for next month expenses and savings',
  })
  async getPredictions(@Request() req) {
    return this.insightsService.getPredictions(req.user.userId);
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger manual insight generation' })
  @ApiResponse({
    status: 200,
    description: 'Generates fresh insights and clears cache',
  })
  async generateInsights(@Request() req, @Query() options: InsightsOptionsDto) {
    // Invalidate cache first
    await this.insightsService.invalidateCache(req.user.userId);

    // Generate fresh insights
    return this.insightsService.generateInsights(req.user.userId, options);
  }
}
