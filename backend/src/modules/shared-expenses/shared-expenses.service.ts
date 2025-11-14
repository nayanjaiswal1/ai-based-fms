import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  SharedExpenseGroup,
  SharedExpenseParticipant,
  SharedExpenseTransaction,
  SharedExpenseType,
  DebtDirection,
  ParticipantRole,
  SharedExpenseSplitType,
} from '@database/entities';
import {
  CreatePersonalDebtDto,
  CreateGroupExpenseDto,
  AddTransactionDto,
  UpdateSharedExpenseGroupDto,
  RecordPaymentDto,
} from './dto/shared-expense.dto';

@Injectable()
export class SharedExpensesService {
  constructor(
    @InjectRepository(SharedExpenseGroup)
    private groupRepository: Repository<SharedExpenseGroup>,
    @InjectRepository(SharedExpenseParticipant)
    private participantRepository: Repository<SharedExpenseParticipant>,
    @InjectRepository(SharedExpenseTransaction)
    private transactionRepository: Repository<SharedExpenseTransaction>,
    private dataSource: DataSource,
  ) {}

  // Check for existing 1-to-1 relationship (duplicate prevention)
  async findExistingOneToOne(
    userId: string,
    otherPersonIdentifier: string,
  ): Promise<SharedExpenseGroup | null> {
    return this.groupRepository.findOne({
      where: [
        {
          createdBy: userId,
          isOneToOne: true,
          isActive: true,
          otherPersonEmail: otherPersonIdentifier,
        },
        {
          createdBy: userId,
          isOneToOne: true,
          isActive: true,
          otherPersonPhone: otherPersonIdentifier,
        },
        {
          createdBy: userId,
          isOneToOne: true,
          isActive: true,
          otherPersonName: otherPersonIdentifier,
        },
      ],
    });
  }

  // Create personal debt (1-to-1)
  async createPersonalDebt(
    userId: string,
    dto: CreatePersonalDebtDto,
  ): Promise<SharedExpenseGroup> {
    // Check for duplicate
    const identifier =
      dto.otherPersonEmail || dto.otherPersonPhone || dto.otherPersonName;
    const existing = await this.findExistingOneToOne(userId, identifier);

    if (existing) {
      // Add to existing debt record
      await this.addTransaction(existing.id, userId, {
        description: dto.description,
        amount: dto.amount,
        date: dto.date,
        paidBy: dto.debtDirection === DebtDirection.LEND ? userId : 'other',
        splitType: SharedExpenseSplitType.FULL,
        categoryId: dto.categoryId,
        notes: dto.notes,
      });

      return this.findOne(existing.id, userId);
    }

    // Create new 1-to-1 group using transaction
    return this.dataSource.transaction(async (manager) => {
      // 1. Create group
      const group = manager.create(SharedExpenseGroup, {
        name: `${dto.debtDirection === DebtDirection.LEND ? 'Loan to' : 'Borrowed from'} ${dto.otherPersonName}`,
        type: SharedExpenseType.PERSONAL_DEBT,
        isOneToOne: true,
        participantCount: 2,
        otherPersonName: dto.otherPersonName,
        otherPersonEmail: dto.otherPersonEmail,
        otherPersonPhone: dto.otherPersonPhone,
        debtDirection: dto.debtDirection,
        currency: dto.currency || 'USD',
        createdBy: userId,
      });
      const savedGroup = await manager.save(group);

      // 2. Create participants
      const userParticipant = manager.create(SharedExpenseParticipant, {
        groupId: savedGroup.id,
        userId,
        role: ParticipantRole.OWNER,
        balance: 0,
      });

      const otherParticipant = manager.create(SharedExpenseParticipant, {
        groupId: savedGroup.id,
        participantName: dto.otherPersonName,
        participantEmail: dto.otherPersonEmail,
        role: ParticipantRole.MEMBER,
        balance: 0,
      });

      await manager.save([userParticipant, otherParticipant]);

      // 3. Create initial transaction
      const paidBy =
        dto.debtDirection === DebtDirection.LEND
          ? userParticipant.id
          : otherParticipant.id;
      const owedBy =
        dto.debtDirection === DebtDirection.LEND
          ? otherParticipant.id
          : userParticipant.id;

      const transaction = manager.create(SharedExpenseTransaction, {
        groupId: savedGroup.id,
        description: dto.description,
        amount: dto.amount,
        date: dto.date,
        currency: dto.currency || 'USD',
        paidBy,
        splitType: SharedExpenseSplitType.FULL,
        splits: {
          [paidBy]: 0,
          [owedBy]: dto.amount,
        },
        categoryId: dto.categoryId,
        notes: dto.notes,
        createdBy: userId,
      });
      await manager.save(transaction);

      // 4. Update balances
      if (dto.debtDirection === DebtDirection.LEND) {
        userParticipant.balance = dto.amount; // User is owed
        otherParticipant.balance = -dto.amount; // Other owes
      } else {
        userParticipant.balance = -dto.amount; // User owes
        otherParticipant.balance = dto.amount; // Other is owed
      }
      await manager.save([userParticipant, otherParticipant]);

      return savedGroup;
    });
  }

  // Create group expense (N participants)
  async createGroupExpense(
    userId: string,
    dto: CreateGroupExpenseDto,
  ): Promise<SharedExpenseGroup> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Create group
      const group = manager.create(SharedExpenseGroup, {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        isOneToOne: false,
        participantCount: 1 + (dto.participantUserIds?.length || 0) + (dto.participantEmails?.length || 0),
        icon: dto.icon,
        color: dto.color,
        currency: dto.currency || 'USD',
        createdBy: userId,
      });
      const savedGroup = await manager.save(group);

      // 2. Add creator as owner
      const owner = manager.create(SharedExpenseParticipant, {
        groupId: savedGroup.id,
        userId,
        role: ParticipantRole.OWNER,
        balance: 0,
      });
      await manager.save(owner);

      // 3. Add other participants
      if (dto.participantUserIds?.length) {
        const participants = dto.participantUserIds.map((uid) =>
          manager.create(SharedExpenseParticipant, {
            groupId: savedGroup.id,
            userId: uid,
            role: ParticipantRole.MEMBER,
            balance: 0,
          }),
        );
        await manager.save(participants);
      }

      if (dto.participantEmails?.length) {
        const participants = dto.participantEmails.map((email) =>
          manager.create(SharedExpenseParticipant, {
            groupId: savedGroup.id,
            participantEmail: email,
            role: ParticipantRole.MEMBER,
            balance: 0,
          }),
        );
        await manager.save(participants);
      }

      return savedGroup;
    });
  }

  // Find all groups for user
  async findAll(
    userId: string,
    filters?: { isOneToOne?: boolean; type?: SharedExpenseType },
  ): Promise<SharedExpenseGroup[]> {
    const query = this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.participants', 'participant')
      .where('participant.userId = :userId', { userId })
      .andWhere('group.isActive = :isActive', { isActive: true });

    if (filters?.isOneToOne !== undefined) {
      query.andWhere('group.isOneToOne = :isOneToOne', {
        isOneToOne: filters.isOneToOne,
      });
    }

    if (filters?.type) {
      query.andWhere('group.type = :type', { type: filters.type });
    }

    return query.getMany();
  }

  // Find one group
  async findOne(groupId: string, userId: string): Promise<SharedExpenseGroup> {
    const participant = await this.participantRepository.findOne({
      where: { groupId, userId },
    });

    if (!participant) {
      throw new NotFoundException(
        'Group not found or you are not a participant',
      );
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['participants', 'transactions'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  // Add transaction to existing group
  async addTransaction(
    groupId: string,
    userId: string,
    dto: AddTransactionDto,
  ): Promise<SharedExpenseTransaction> {
    await this.findOne(groupId, userId); // Check access

    return this.dataSource.transaction(async (manager) => {
      // 1. Create transaction
      const transaction = manager.create(SharedExpenseTransaction, {
        ...dto,
        groupId,
        createdBy: userId,
      });
      const savedTx = await manager.save(transaction);

      // 2. Recalculate balances
      await this.recalculateBalances(groupId, manager);

      return savedTx;
    });
  }

  // Recalculate participant balances
  private async recalculateBalances(
    groupId: string,
    manager: any,
  ): Promise<void> {
    const transactions = await manager.find(SharedExpenseTransaction, {
      where: { groupId, deletedAt: null },
    });

    const participants = await manager.find(SharedExpenseParticipant, {
      where: { groupId },
    });

    // Reset balances
    const balances: Record<string, number> = {};
    participants.forEach((p) => {
      balances[p.id] = 0;
    });

    // Calculate balances from transactions
    transactions.forEach((tx) => {
      if (tx.isSettlement) return;

      // Person who paid gets positive balance (they are owed)
      balances[tx.paidBy] = (balances[tx.paidBy] || 0) + tx.amount;

      // People who owe get negative balance
      Object.entries(tx.splits).forEach(([participantId, amount]) => {
        balances[participantId] =
          (balances[participantId] || 0) - (amount as number);
      });
    });

    // Update participant balances
    for (const participant of participants) {
      participant.balance = balances[participant.id] || 0;
      await manager.save(participant);
    }
  }

  // Update group
  async update(
    groupId: string,
    userId: string,
    dto: UpdateSharedExpenseGroupDto,
  ): Promise<SharedExpenseGroup> {
    const group = await this.findOne(groupId, userId);

    // Check if user is owner/admin
    const participant = await this.participantRepository.findOne({
      where: { groupId, userId },
    });

    if (
      participant?.role !== ParticipantRole.OWNER &&
      participant?.role !== ParticipantRole.ADMIN
    ) {
      throw new ForbiddenException('Only owners/admins can update the group');
    }

    Object.assign(group, dto);
    return this.groupRepository.save(group);
  }

  // Delete/archive group
  async remove(groupId: string, userId: string): Promise<void> {
    const group = await this.findOne(groupId, userId);

    const participant = await this.participantRepository.findOne({
      where: { groupId, userId },
    });

    if (participant?.role !== ParticipantRole.OWNER) {
      throw new ForbiddenException('Only the owner can delete the group');
    }

    group.isActive = false;
    await this.groupRepository.save(group);
  }

  // Get consolidated debts (for 1-to-1)
  async getConsolidatedDebts(userId: string): Promise<any[]> {
    const debts = await this.groupRepository.find({
      where: { createdBy: userId, isOneToOne: true, isActive: true },
      relations: ['participants'],
    });

    // Group by person
    const consolidated = new Map<string, any>();

    for (const debt of debts) {
      const key =
        debt.otherPersonEmail || debt.otherPersonPhone || debt.otherPersonName;

      if (!consolidated.has(key)) {
        consolidated.set(key, {
          personName: debt.otherPersonName,
          personEmail: debt.otherPersonEmail,
          personPhone: debt.otherPersonPhone,
          totalBalance: 0,
          debts: [],
        });
      }

      const entry = consolidated.get(key);
      const userParticipant = debt.participants.find((p) => p.userId === userId);
      entry.totalBalance += userParticipant?.balance || 0;
      entry.debts.push(debt);
    }

    return Array.from(consolidated.values());
  }
}
