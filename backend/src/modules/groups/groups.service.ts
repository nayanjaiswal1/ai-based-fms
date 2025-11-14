import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Group,
  GroupMember,
  GroupMemberRole,
  GroupTransaction,
  SplitType,
} from '@database/entities';
import { CreateGroupDto, UpdateGroupDto, AddMemberDto } from './dto/group.dto';
import {
  CreateGroupTransactionDto,
  UpdateGroupTransactionDto,
  SettleUpDto,
} from './dto/group-transaction.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    @InjectRepository(GroupTransaction)
    private transactionRepository: Repository<GroupTransaction>,
    @Optional() private notificationsGateway: NotificationsGateway,
  ) {}

  // Helper method to safely broadcast events when WebSocket is enabled
  private async broadcastGroupEvent(groupId: string, event: string, data: any) {
    if (this.notificationsGateway) {
      await this.notificationsGateway.broadcastGroupEvent(groupId, event, data);
    }
  }

  async create(userId: string, createDto: CreateGroupDto) {
    const group = this.groupRepository.create({
      ...createDto,
      createdBy: userId,
    });

    const savedGroup = await this.groupRepository.save(group);

    // Add creator as admin
    await this.addMember(savedGroup.id, userId, {
      userId,
      role: 'admin',
    });

    return this.findOne(savedGroup.id, userId);
  }

  async findAll(userId: string) {
    const memberships = await this.memberRepository.find({
      where: { userId, isActive: true },
      relations: ['group'],
    });

    return memberships.filter((m) => m.group.isActive).map((m) => m.group);
  }

  async findOne(id: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { groupId: id, userId },
      relations: ['group'],
    });

    if (!member) {
      throw new NotFoundException('Group not found or you are not a member');
    }

    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });

    return group;
  }

  async update(id: string, userId: string, updateDto: UpdateGroupDto) {
    await this.checkAdminAccess(id, userId);

    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    Object.assign(group, updateDto);
    return this.groupRepository.save(group);
  }

  async remove(id: string, userId: string) {
    await this.checkAdminAccess(id, userId);

    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    group.isActive = false;
    return this.groupRepository.save(group);
  }

  async addMember(groupId: string, requestUserId: string, addMemberDto: AddMemberDto) {
    // Check if requester is admin (except when creating group)
    if (requestUserId !== addMemberDto.userId) {
      await this.checkAdminAccess(groupId, requestUserId);
    }

    // Check if user is already a member
    const existing = await this.memberRepository.findOne({
      where: { groupId, userId: addMemberDto.userId },
    });

    if (existing) {
      if (existing.isActive) {
        throw new BadRequestException('User is already a member');
      }
      // Reactivate if was previously removed
      existing.isActive = true;
      existing.role = (addMemberDto.role as GroupMemberRole) || GroupMemberRole.MEMBER;
      return this.memberRepository.save(existing);
    }

    const member = this.memberRepository.create({
      groupId,
      userId: addMemberDto.userId,
      role: (addMemberDto.role as GroupMemberRole) || GroupMemberRole.MEMBER,
    });

    const saved = await this.memberRepository.save(member);

    // Broadcast event to all group members
    await this.broadcastGroupEvent(groupId, 'member:joined', {
      member: saved,
      addedBy: requestUserId,
      timestamp: new Date().toISOString(),
    });

    return saved;
  }

  async removeMember(groupId: string, requestUserId: string, memberUserId: string) {
    await this.checkAdminAccess(groupId, requestUserId);

    const member = await this.memberRepository.findOne({
      where: { groupId, userId: memberUserId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.isActive = false;
    const saved = await this.memberRepository.save(member);

    // Broadcast event to all group members
    await this.broadcastGroupEvent(groupId, 'member:left', {
      userId: memberUserId,
      removedBy: requestUserId,
      timestamp: new Date().toISOString(),
    });

    return saved;
  }

  async updateMemberRole(
    groupId: string,
    requestUserId: string,
    memberUserId: string,
    role: GroupMemberRole,
  ) {
    await this.checkAdminAccess(groupId, requestUserId);

    const member = await this.memberRepository.findOne({
      where: { groupId, userId: memberUserId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.role = role;
    return this.memberRepository.save(member);
  }

  async getMembers(groupId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    return this.memberRepository.find({
      where: { groupId, isActive: true },
      relations: ['user'],
    });
  }

  async addTransaction(groupId: string, userId: string, createDto: CreateGroupTransactionDto) {
    await this.checkMemberAccess(groupId, userId);

    // Validate splits
    const splitTotal = Object.values(createDto.splits).reduce((sum, amount) => sum + amount, 0);
    if (Math.abs(splitTotal - createDto.amount) > 0.01) {
      throw new BadRequestException('Split amounts must equal transaction amount');
    }

    const transaction = this.transactionRepository.create({
      ...createDto,
      groupId,
      createdBy: userId,
    });

    const saved = await this.transactionRepository.save(transaction);

    // Update member balances
    await this.updateMemberBalances(groupId, saved);

    // Broadcast event to all group members
    await this.broadcastGroupEvent(groupId, 'transaction:created', {
      transaction: saved,
      createdBy: userId,
      timestamp: new Date().toISOString(),
    });

    return saved;
  }

  async getTransactions(groupId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    return this.transactionRepository.find({
      where: { groupId, isDeleted: false },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async updateTransaction(
    groupId: string,
    transactionId: string,
    userId: string,
    updateDto: UpdateGroupTransactionDto,
  ) {
    await this.checkMemberAccess(groupId, userId);

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, groupId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Reverse old balance changes
    await this.reverseMemberBalances(groupId, transaction);

    Object.assign(transaction, { ...updateDto, updatedBy: userId });
    const updated = await this.transactionRepository.save(transaction);

    // Apply new balance changes
    await this.updateMemberBalances(groupId, updated);

    // Broadcast event to all group members
    await this.broadcastGroupEvent(groupId, 'transaction:updated', {
      transaction: updated,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async deleteTransaction(groupId: string, transactionId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId, groupId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Reverse balance changes
    await this.reverseMemberBalances(groupId, transaction);

    transaction.isDeleted = true;
    const result = await this.transactionRepository.save(transaction);

    // Broadcast event to all group members
    await this.broadcastGroupEvent(groupId, 'transaction:deleted', {
      transactionId: transaction.id,
      deletedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  async settleUp(groupId: string, userId: string, settleDto: SettleUpDto) {
    await this.checkMemberAccess(groupId, userId);

    // Create settlement transaction
    const settlement = this.transactionRepository.create({
      groupId,
      description: `Settlement: ${settleDto.fromUserId} → ${settleDto.toUserId}`,
      amount: settleDto.amount,
      date: settleDto.date || new Date(),
      paidBy: settleDto.toUserId,
      splitType: SplitType.CUSTOM,
      splits: {
        [settleDto.fromUserId]: settleDto.amount,
      },
      notes: settleDto.notes || 'Settlement payment',
      isSettlement: true,
      createdBy: userId,
    });

    const saved = await this.transactionRepository.save(settlement);
    await this.updateMemberBalances(groupId, saved);

    // Broadcast event to all group members
    await this.broadcastGroupEvent(groupId, 'settlement:recorded', {
      settlement: saved,
      recordedBy: userId,
      timestamp: new Date().toISOString(),
    });

    return saved;
  }

  async getBalances(groupId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    const members = await this.memberRepository.find({
      where: { groupId, isActive: true },
      relations: ['user'],
    });

    return members.map((member) => ({
      userId: member.userId,
      name: `${member.user.firstName} ${member.user.lastName}`,
      balance: member.balance,
      owes: member.balance < 0 ? Math.abs(member.balance) : 0,
      isOwed: member.balance > 0 ? member.balance : 0,
    }));
  }

  async getSettlementSuggestions(groupId: string, userId: string) {
    await this.checkMemberAccess(groupId, userId);

    const balances = await this.getBalances(groupId, userId);

    const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);

    const suggestions = [];
    let i = 0,
      j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (amount > 0.01) {
        suggestions.push({
          from: debtor.userId,
          fromName: debtor.name,
          to: creditor.userId,
          toName: creditor.name,
          amount: Number(amount.toFixed(2)),
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return suggestions;
  }

  private async updateMemberBalances(groupId: string, transaction: GroupTransaction) {
    const payer = await this.memberRepository.findOne({
      where: { groupId, userId: transaction.paidBy },
    });

    if (!payer) return;

    // Payer gets credited for the full amount
    payer.balance += transaction.amount;
    await this.memberRepository.save(payer);

    // Each member owes their split
    for (const [userId, amount] of Object.entries(transaction.splits)) {
      const member = await this.memberRepository.findOne({
        where: { groupId, userId },
      });

      if (member) {
        member.balance -= amount;
        await this.memberRepository.save(member);
      }
    }
  }

  private async reverseMemberBalances(groupId: string, transaction: GroupTransaction) {
    const payer = await this.memberRepository.findOne({
      where: { groupId, userId: transaction.paidBy },
    });

    if (payer) {
      payer.balance -= transaction.amount;
      await this.memberRepository.save(payer);
    }

    for (const [userId, amount] of Object.entries(transaction.splits)) {
      const member = await this.memberRepository.findOne({
        where: { groupId, userId },
      });

      if (member) {
        member.balance += amount;
        await this.memberRepository.save(member);
      }
    }
  }

  private async checkMemberAccess(groupId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      where: { groupId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return member;
  }

  private async checkAdminAccess(groupId: string, userId: string) {
    const member = await this.checkMemberAccess(groupId, userId);

    if (member.role !== GroupMemberRole.ADMIN) {
      throw new ForbiddenException('Only group admins can perform this action');
    }

    return member;
  }
}
