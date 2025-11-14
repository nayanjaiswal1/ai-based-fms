import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { GroupCommentsService } from './group-comments.service';
import { RecurringGroupTransactionsService } from './recurring-group-transactions.service';
import { GroupBudgetsService } from './group-budgets.service';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto } from './dto/group.dto';
import {
  CreateGroupTransactionDto,
  UpdateGroupTransactionDto,
  SettleUpDto,
} from './dto/group-transaction.dto';
import { CreateGroupCommentDto, UpdateGroupCommentDto } from './dto/group-comment.dto';
import {
  CreateRecurringGroupTransactionDto,
  UpdateRecurringGroupTransactionDto,
} from './dto/recurring-group-transaction.dto';
import { CreateGroupBudgetDto, UpdateGroupBudgetDto } from './dto/group-budget.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly groupCommentsService: GroupCommentsService,
    private readonly recurringTransactionsService: RecurringGroupTransactionsService,
    private readonly groupBudgetsService: GroupBudgetsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  create(@CurrentUser('id') userId: string, @Body() createDto: CreateGroupDto) {
    return this.groupsService.create(userId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all groups user is a member of' })
  findAll(@CurrentUser('id') userId: string) {
    return this.groupsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group (admin only)' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, userId, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group (admin only)' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.remove(id, userId);
  }

  // Member Management
  @Get(':id/members')
  @ApiOperation({ summary: 'Get all group members' })
  getMembers(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.getMembers(id, userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to the group (admin only)' })
  addMember(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.groupsService.addMember(id, userId, addMemberDto);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from the group (admin only)' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.removeMember(id, userId, memberId);
  }

  // Transactions
  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get all group transactions' })
  getTransactions(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.getTransactions(id, userId);
  }

  @Post(':id/transactions')
  @ApiOperation({ summary: 'Add a transaction to the group' })
  @ApiResponse({ status: 201, description: 'Transaction added successfully' })
  addTransaction(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateGroupTransactionDto,
  ) {
    return this.groupsService.addTransaction(id, userId, createDto);
  }

  @Patch(':id/transactions/:transactionId')
  @ApiOperation({ summary: 'Update a group transaction' })
  updateTransaction(
    @Param('id') id: string,
    @Param('transactionId') transactionId: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateGroupTransactionDto,
  ) {
    return this.groupsService.updateTransaction(id, transactionId, userId, updateDto);
  }

  @Delete(':id/transactions/:transactionId')
  @ApiOperation({ summary: 'Delete a group transaction' })
  deleteTransaction(
    @Param('id') id: string,
    @Param('transactionId') transactionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.groupsService.deleteTransaction(id, transactionId, userId);
  }

  // Balances & Settlements
  @Get(':id/balances')
  @ApiOperation({ summary: 'Get member balances' })
  @ApiResponse({ status: 200, description: 'Returns balance for each member' })
  getBalances(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.getBalances(id, userId);
  }

  @Get(':id/settlements')
  @ApiOperation({ summary: 'Get settlement suggestions' })
  @ApiResponse({ status: 200, description: 'Returns optimal settlement suggestions' })
  getSettlements(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupsService.getSettlementSuggestions(id, userId);
  }

  @Post(':id/settle')
  @ApiOperation({ summary: 'Record a settlement payment' })
  @ApiResponse({ status: 201, description: 'Settlement recorded successfully' })
  settleUp(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() settleDto: SettleUpDto,
  ) {
    return this.groupsService.settleUp(id, userId, settleDto);
  }

  // Comments
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get all comments in a group' })
  getComments(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupCommentsService.findAll(id, userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to the group' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  createComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateGroupCommentDto,
  ) {
    return this.groupCommentsService.create(id, userId, createDto);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateGroupCommentDto,
  ) {
    return this.groupCommentsService.update(commentId, userId, updateDto);
  }

  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  deleteComment(@Param('commentId') commentId: string, @CurrentUser('id') userId: string) {
    return this.groupCommentsService.remove(commentId, userId);
  }

  // Recurring Transactions
  @Get(':id/recurring')
  @ApiOperation({ summary: 'Get all recurring transactions for a group' })
  getRecurringTransactions(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.recurringTransactionsService.findAll(id, userId);
  }

  @Post(':id/recurring')
  @ApiOperation({ summary: 'Create a recurring transaction' })
  @ApiResponse({ status: 201, description: 'Recurring transaction created successfully' })
  createRecurringTransaction(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateRecurringGroupTransactionDto,
  ) {
    return this.recurringTransactionsService.create(id, userId, createDto);
  }

  @Patch('recurring/:recurringId')
  @ApiOperation({ summary: 'Update a recurring transaction' })
  updateRecurringTransaction(
    @Param('recurringId') recurringId: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateRecurringGroupTransactionDto,
  ) {
    return this.recurringTransactionsService.update(recurringId, userId, updateDto);
  }

  @Delete('recurring/:recurringId')
  @ApiOperation({ summary: 'Delete a recurring transaction' })
  deleteRecurringTransaction(
    @Param('recurringId') recurringId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recurringTransactionsService.remove(recurringId, userId);
  }

  @Post('recurring/:recurringId/pause')
  @ApiOperation({ summary: 'Pause a recurring transaction' })
  pauseRecurringTransaction(
    @Param('recurringId') recurringId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recurringTransactionsService.pause(recurringId, userId);
  }

  @Post('recurring/:recurringId/resume')
  @ApiOperation({ summary: 'Resume a paused recurring transaction' })
  resumeRecurringTransaction(
    @Param('recurringId') recurringId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.recurringTransactionsService.resume(recurringId, userId);
  }

  // Group Budgets
  @Get(':id/budgets')
  @ApiOperation({ summary: 'Get all budgets for a group' })
  getGroupBudgets(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.groupBudgetsService.findAll(id, userId);
  }

  @Post(':id/budgets')
  @ApiOperation({ summary: 'Create a group budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  createGroupBudget(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateGroupBudgetDto,
  ) {
    return this.groupBudgetsService.create(id, userId, createDto);
  }

  @Get('budgets/:budgetId')
  @ApiOperation({ summary: 'Get a specific group budget' })
  getGroupBudget(@Param('budgetId') budgetId: string, @CurrentUser('id') userId: string) {
    return this.groupBudgetsService.findOne(budgetId, userId);
  }

  @Get('budgets/:budgetId/progress')
  @ApiOperation({ summary: 'Get budget progress and status' })
  getGroupBudgetProgress(@Param('budgetId') budgetId: string, @CurrentUser('id') userId: string) {
    return this.groupBudgetsService.getProgress(budgetId, userId);
  }

  @Patch('budgets/:budgetId')
  @ApiOperation({ summary: 'Update a group budget' })
  updateGroupBudget(
    @Param('budgetId') budgetId: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateGroupBudgetDto,
  ) {
    return this.groupBudgetsService.update(budgetId, userId, updateDto);
  }

  @Delete('budgets/:budgetId')
  @ApiOperation({ summary: 'Delete a group budget' })
  deleteGroupBudget(@Param('budgetId') budgetId: string, @CurrentUser('id') userId: string) {
    return this.groupBudgetsService.remove(budgetId, userId);
  }
}
