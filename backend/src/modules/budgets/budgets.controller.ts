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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Budgets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateBudgetDto) {
    return this.budgetsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets' })
  findAll(@CurrentUser('id') userId: string, @Query('isActive') isActive?: boolean) {
    return this.budgetsService.findAll(userId, isActive);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active budgets for current period' })
  findActive(@CurrentUser('id') userId: string) {
    return this.budgetsService.findActive(userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary' })
  getSummary(@CurrentUser('id') userId: string) {
    return this.budgetsService.getBudgetSummary(userId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Check budget alerts' })
  checkAlerts(@CurrentUser('id') userId: string) {
    return this.budgetsService.checkBudgetAlerts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a budget by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a budget' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.remove(id, userId);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Refresh budget spending calculation' })
  refreshSpending(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.budgetsService.updateSpentAmount(id);
  }
}
