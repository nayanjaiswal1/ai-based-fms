import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { MergeTransactionsDto, MarkNotDuplicateDto } from './dto/merge-transactions.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createDto: any) {
    return this.transactionsService.create(userId, createDto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() filters: any) {
    return this.transactionsService.findAll(userId, filters);
  }

  @Get('stats')
  getStats(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.transactionsService.getStats(userId, new Date(startDate), new Date(endDate));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.transactionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() updateDto: any) {
    return this.transactionsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.transactionsService.remove(id, userId);
  }

  @Post(':id/merge')
  @ApiOperation({ summary: 'Merge duplicate transactions into a primary transaction' })
  mergeTransactions(
    @Param('id') primaryId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MergeTransactionsDto,
  ) {
    return this.transactionsService.mergeTransactions(userId, primaryId, dto.duplicateIds);
  }

  @Post(':id/unmerge')
  @ApiOperation({ summary: 'Unmerge a previously merged transaction' })
  unmergeTransaction(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.transactionsService.unmergeTransaction(userId, id);
  }

  @Post(':id/mark-not-duplicate')
  @ApiOperation({ summary: 'Mark two transactions as not duplicates' })
  markAsNotDuplicate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MarkNotDuplicateDto,
  ) {
    return this.transactionsService.markAsNotDuplicate(userId, id, dto.comparedWithId);
  }

  @Get(':id/merged')
  @ApiOperation({ summary: 'Get transactions that were merged into this transaction' })
  getMergedTransactions(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.transactionsService.getMergedTransactions(userId, id);
  }
}
