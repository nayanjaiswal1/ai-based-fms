import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto } from './dto/group.dto';
import { CreateGroupTransactionDto, UpdateGroupTransactionDto, SettleUpDto } from './dto/group-transaction.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

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
}
