import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  DateRangeQueryDto,
  CategoryAnalyticsQueryDto,
  AccountAnalyticsQueryDto,
} from './dto/analytics.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get comprehensive financial overview' })
  @ApiResponse({ status: 200, description: 'Returns complete financial summary' })
  getOverview(@CurrentUser('id') userId: string, @Query() queryDto: DateRangeQueryDto) {
    return this.analyticsService.getFinancialOverview(userId, queryDto);
  }

  @Get('spending/by-category')
  @ApiOperation({ summary: 'Get spending breakdown by category' })
  @ApiResponse({
    status: 200,
    description: 'Returns spending grouped by categories with percentages',
  })
  getSpendingByCategory(@CurrentUser('id') userId: string, @Query() queryDto: DateRangeQueryDto) {
    return this.analyticsService.getSpendingByCategory(userId, queryDto);
  }

  @Get('income/by-category')
  @ApiOperation({ summary: 'Get income breakdown by category' })
  @ApiResponse({ status: 200, description: 'Returns income grouped by categories' })
  getIncomeByCategory(@CurrentUser('id') userId: string, @Query() queryDto: DateRangeQueryDto) {
    return this.analyticsService.getIncomeByCategory(userId, queryDto);
  }

  @Get('trends/monthly')
  @ApiOperation({ summary: 'Get monthly income/expense trends' })
  @ApiQuery({ name: 'months', type: Number, required: false, example: 12 })
  @ApiResponse({ status: 200, description: 'Returns monthly trends for the past N months' })
  getMonthlyTrends(@CurrentUser('id') userId: string, @Query('months') months?: number) {
    return this.analyticsService.getMonthlyTrends(userId, months ? Number(months) : 12);
  }

  @Get('trends/category/:categoryId')
  @ApiOperation({ summary: 'Get spending trends for a specific category' })
  @ApiQuery({ name: 'months', type: Number, required: false, example: 6 })
  @ApiResponse({ status: 200, description: 'Returns category spending trends over time' })
  getCategoryTrends(
    @CurrentUser('id') userId: string,
    @Param('categoryId') categoryId: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getCategoryTrends(userId, categoryId, months ? Number(months) : 6);
  }

  @Get('trends/account/:accountId')
  @ApiOperation({ summary: 'Get account balance trends' })
  @ApiQuery({ name: 'months', type: Number, required: false, example: 12 })
  @ApiResponse({ status: 200, description: 'Returns account balance history' })
  getAccountTrends(
    @CurrentUser('id') userId: string,
    @Param('accountId') accountId: string,
    @Query('months') months?: number,
  ) {
    return this.analyticsService.getAccountTrends(userId, accountId, months ? Number(months) : 12);
  }

  @Get('comparison')
  @ApiOperation({ summary: 'Compare current period with previous period' })
  @ApiResponse({ status: 200, description: 'Returns period-over-period comparison' })
  getComparison(@CurrentUser('id') userId: string, @Query() queryDto: DateRangeQueryDto) {
    return this.analyticsService.getComparison(userId, queryDto);
  }

  @Get('net-worth')
  @ApiOperation({ summary: 'Get net worth over time' })
  @ApiQuery({ name: 'months', type: Number, required: false, example: 12 })
  @ApiResponse({ status: 200, description: 'Returns net worth history and trends' })
  getNetWorth(@CurrentUser('id') userId: string, @Query('months') months?: number) {
    return this.analyticsService.getNetWorth(userId, months ? Number(months) : 12);
  }
}
