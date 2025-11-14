import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SharedExpensesService } from './shared-expenses.service';
import {
  CreatePersonalDebtDto,
  CreateGroupExpenseDto,
  AddTransactionDto,
  UpdateSharedExpenseGroupDto,
} from './dto/shared-expense.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('shared-expenses')
@UseGuards(JwtAuthGuard)
export class SharedExpensesController {
  constructor(private readonly sharedExpensesService: SharedExpensesService) {}

  @Post('personal-debt')
  createPersonalDebt(@Request() req, @Body() dto: CreatePersonalDebtDto) {
    return this.sharedExpensesService.createPersonalDebt(req.user.userId, dto);
  }

  @Post('group')
  createGroup(@Request() req, @Body() dto: CreateGroupExpenseDto) {
    return this.sharedExpensesService.createGroupExpense(req.user.userId, dto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('isOneToOne') isOneToOne?: string,
    @Query('type') type?: string,
  ) {
    const filters: any = {};
    if (isOneToOne !== undefined) {
      filters.isOneToOne = isOneToOne === 'true';
    }
    if (type) {
      filters.type = type;
    }
    return this.sharedExpensesService.findAll(req.user.userId, filters);
  }

  @Get('consolidated-debts')
  getConsolidatedDebts(@Request() req) {
    return this.sharedExpensesService.getConsolidatedDebts(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.sharedExpensesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSharedExpenseGroupDto,
  ) {
    return this.sharedExpensesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.sharedExpensesService.remove(id, req.user.userId);
  }

  @Post(':id/transactions')
  addTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddTransactionDto,
  ) {
    return this.sharedExpensesService.addTransaction(id, req.user.userId, dto);
  }

  @Get(':id/check-duplicate')
  async checkDuplicate(
    @Request() req,
    @Query('identifier') identifier: string,
  ) {
    const existing = await this.sharedExpensesService.findExistingOneToOne(
      req.user.userId,
      identifier,
    );
    return { exists: !!existing, group: existing };
  }
}
