import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto/investment.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Investments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investment' })
  @ApiResponse({ status: 201, description: 'Investment created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateInvestmentDto) {
    return this.investmentsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all investments' })
  findAll(@CurrentUser('id') userId: string, @Query('isActive') isActive?: boolean) {
    return this.investmentsService.findAll(userId, isActive);
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get portfolio summary' })
  @ApiResponse({ status: 200, description: 'Returns portfolio summary with composition' })
  getPortfolio(@CurrentUser('id') userId: string) {
    return this.investmentsService.getPortfolioSummary(userId);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Returns performance metrics and best/worst performers' })
  getPerformance(@CurrentUser('id') userId: string) {
    return this.investmentsService.getPerformanceMetrics(userId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get investments by type' })
  findByType(@CurrentUser('id') userId: string, @Param('type') type: string) {
    return this.investmentsService.findByType(userId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an investment by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.investmentsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an investment' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateInvestmentDto,
  ) {
    return this.investmentsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an investment' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.investmentsService.remove(id, userId);
  }
}
