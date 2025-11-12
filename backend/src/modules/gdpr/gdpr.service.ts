import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  Account,
  Transaction,
  Category,
  Tag,
  Budget,
  GroupMember,
  Group,
  GroupTransaction,
  Investment,
  LendBorrow,
  Notification,
  Reminder,
  EmailConnection,
  ImportLog,
  Session,
  AuditLog,
  DeletedUser,
} from '@database/entities';

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(GroupTransaction)
    private groupTransactionRepository: Repository<GroupTransaction>,
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
    @InjectRepository(LendBorrow)
    private lendBorrowRepository: Repository<LendBorrow>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
    @InjectRepository(EmailConnection)
    private emailConnectionRepository: Repository<EmailConnection>,
    @InjectRepository(ImportLog)
    private importLogRepository: Repository<ImportLog>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(DeletedUser)
    private deletedUserRepository: Repository<DeletedUser>,
    private dataSource: DataSource,
  ) {}

  async exportUserData(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch all user data
    const [
      accounts,
      transactions,
      categories,
      tags,
      budgets,
      groupMemberships,
      investments,
      lendBorrowRecords,
      notifications,
      reminders,
      emailConnections,
      importLogs,
      sessions,
      auditLogs,
    ] = await Promise.all([
      this.accountRepository.find({ where: { user: { id: userId } } }),
      this.transactionRepository.find({
        where: { user: { id: userId } },
        relations: ['account', 'category', 'tags'],
      }),
      this.categoryRepository.find({ where: { user: { id: userId } } }),
      this.tagRepository.find({ where: { user: { id: userId } } }),
      this.budgetRepository.find({
        where: { user: { id: userId } },
        relations: ['category'],
      }),
      this.groupMemberRepository.find({
        where: { user: { id: userId } },
        relations: ['group'],
      }),
      this.investmentRepository.find({ where: { user: { id: userId } } }),
      this.lendBorrowRepository.find({ where: { user: { id: userId } } }),
      this.notificationRepository.find({ where: { user: { id: userId } } }),
      this.reminderRepository.find({ where: { user: { id: userId } } }),
      this.emailConnectionRepository.find({ where: { user: { id: userId } } }),
      this.importLogRepository.find({ where: { user: { id: userId } } }),
      this.sessionRepository.find({ where: { user: { id: userId } } }),
      this.auditLogRepository.find({ where: { userId } }),
    ]);

    // Fetch group transactions for groups user is a member of
    const groupIds = groupMemberships.map((gm) => gm.group.id);
    const groupTransactions =
      groupIds.length > 0
        ? await this.groupTransactionRepository
            .createQueryBuilder('gt')
            .where('gt.groupId IN (:...groupIds)', { groupIds })
            .getMany()
        : [];

    // Sanitize user data (remove sensitive fields)
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiry: user.subscriptionExpiry,
      language: user.language,
      region: user.region,
      currency: user.currency,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Build export data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        version: '1.0',
      },
      user: sanitizedUser,
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance,
        currency: a.currency,
        isActive: a.isActive,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        accountId: t.account?.id,
        categoryId: t.category?.id,
        categoryName: t.category?.name,
        tags: t.tags?.map((tag) => ({ id: tag.id, name: tag.name })),
        source: t.source,
        notes: t.notes,
        location: t.location,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        parentId: c.parentId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      budgets: budgets.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        period: b.period,
        type: b.type,
        categoryId: b.category?.id,
        categoryName: b.category?.name,
        startDate: b.startDate,
        endDate: b.endDate,
        alertThreshold: b.alertThreshold,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
      groups: groupMemberships.map((gm) => ({
        id: gm.group.id,
        name: gm.group.name,
        description: gm.group.description,
        memberRole: gm.role,
        joinedAt: gm.joinedAt,
      })),
      groupTransactions: groupTransactions.map((gt) => ({
        id: gt.id,
        groupId: gt.groupId,
        description: gt.description,
        amount: gt.amount,
        paidBy: gt.paidBy,
        splitType: gt.splitType,
        date: gt.date,
        createdAt: gt.createdAt,
      })),
      investments: investments.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        symbol: i.symbol,
        quantity: i.quantity,
        purchasePrice: i.purchasePrice,
        currentPrice: i.currentPrice,
        purchaseDate: i.purchaseDate,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      lendBorrowRecords: lendBorrowRecords.map((lb) => ({
        id: lb.id,
        type: lb.type,
        amount: lb.amount,
        partyName: lb.partyName,
        description: lb.description,
        dueDate: lb.dueDate,
        status: lb.status,
        paidAmount: lb.paidAmount,
        createdAt: lb.createdAt,
        updatedAt: lb.updatedAt,
      })),
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        status: n.status,
        createdAt: n.createdAt,
      })),
      reminders: reminders.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        description: r.description,
        dueDate: r.dueDate,
        frequency: r.frequency,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      emailConnections: emailConnections.map((ec) => ({
        id: ec.id,
        provider: ec.provider,
        email: ec.email,
        isActive: ec.isActive,
        lastSyncedAt: ec.lastSyncedAt,
        createdAt: ec.createdAt,
      })),
      importLogs: importLogs.map((il) => ({
        id: il.id,
        fileName: il.fileName,
        fileType: il.fileType,
        status: il.status,
        recordsImported: il.recordsImported,
        recordsFailed: il.recordsFailed,
        createdAt: il.createdAt,
      })),
      sessions: sessions.map((s) => ({
        id: s.id,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        deviceInfo: s.deviceInfo,
        lastActivityAt: s.lastActivityAt,
        createdAt: s.createdAt,
      })),
      auditLogs: auditLogs.map((al) => ({
        id: al.id,
        action: al.action,
        resource: al.resource,
        resourceId: al.resourceId,
        details: al.details,
        ipAddress: al.ipAddress,
        userAgent: al.userAgent,
        createdAt: al.createdAt,
      })),
    };

    return exportData;
  }

  async deleteUserAccount(userId: string, password: string, reason?: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Use transaction to ensure atomic deletion
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Delete sessions
      await queryRunner.manager.delete(Session, { user: { id: userId } });

      // 2. Delete email connections
      await queryRunner.manager.delete(EmailConnection, { user: { id: userId } });

      // 3. Delete import logs
      await queryRunner.manager.delete(ImportLog, { user: { id: userId } });

      // 4. Delete reminders
      await queryRunner.manager.delete(Reminder, { user: { id: userId } });

      // 5. Delete notifications
      await queryRunner.manager.delete(Notification, { user: { id: userId } });

      // 6. Delete audit logs
      await queryRunner.manager.delete(AuditLog, { userId });

      // 7. Delete lend/borrow records
      await queryRunner.manager.delete(LendBorrow, { user: { id: userId } });

      // 8. Delete investments
      await queryRunner.manager.delete(Investment, { user: { id: userId } });

      // 9. Handle group memberships
      // Get groups where user is the owner
      const groupMemberships = await queryRunner.manager.find(GroupMember, {
        where: { user: { id: userId } },
        relations: ['group'],
      });

      const ownedGroups = groupMemberships.filter((gm) => gm.role === 'owner');
      const memberGroups = groupMemberships.filter((gm) => gm.role !== 'owner');

      // For owned groups, transfer ownership or delete if user is the only member
      for (const membership of ownedGroups) {
        const groupId = membership.group.id;

        // Count other members
        const otherMembers = await queryRunner.manager.find(GroupMember, {
          where: { group: { id: groupId } },
          relations: ['user'],
        });

        if (otherMembers.length > 1) {
          // Transfer ownership to the first other member
          const newOwner = otherMembers.find((m) => m.user.id !== userId);
          if (newOwner) {
            newOwner.role = 'owner';
            await queryRunner.manager.save(GroupMember, newOwner);
          }
        } else {
          // Delete the group and its transactions
          await queryRunner.manager.delete(GroupTransaction, { group: { id: groupId } });
          await queryRunner.manager.delete(GroupMember, { group: { id: groupId } });
          await queryRunner.manager.delete(Group, { id: groupId });
          continue; // Skip membership deletion as group is deleted
        }
      }

      // Remove user from all groups
      await queryRunner.manager.delete(GroupMember, { user: { id: userId } });

      // 10. Delete budgets
      await queryRunner.manager.delete(Budget, { user: { id: userId } });

      // 11. Delete transactions
      await queryRunner.manager.delete(Transaction, { user: { id: userId } });

      // 12. Delete accounts
      await queryRunner.manager.delete(Account, { user: { id: userId } });

      // 13. Delete custom tags
      await queryRunner.manager.delete(Tag, { user: { id: userId } });

      // 14. Delete custom categories
      await queryRunner.manager.delete(Category, { user: { id: userId } });

      // 15. Record deletion in deleted_users table
      const deletedUser = queryRunner.manager.create(DeletedUser, {
        originalUserId: userId,
        reason: reason || null,
        metadata: JSON.stringify({
          email: user.email, // Store email hash for potential legal requirements
          deletedBy: 'user',
          userRole: user.role,
        }),
      });
      await queryRunner.manager.save(DeletedUser, deletedUser);

      // 16. Finally delete the user
      await queryRunner.manager.delete(User, { id: userId });

      await queryRunner.commitTransaction();

      return {
        message: 'Account successfully deleted',
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Failed to delete account: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
