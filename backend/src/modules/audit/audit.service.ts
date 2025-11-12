import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLog, AuditAction } from '@database/entities/audit-log.entity';
import {
  AuditFiltersDto,
  AuditLogDto,
  AuditLogResponseDto,
  CreateAuditLogDto,
  UserActivityResponseDto,
  UserActivityDto,
} from './dto/audit-response.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Get audit logs for a user with filters and pagination
   */
  async getAuditLogs(
    userId: string,
    filters: AuditFiltersDto,
  ): Promise<AuditLogResponseDto> {
    const { page = 1, limit = 50, startDate, endDate, action, entityType, entityId, search } = filters;

    const where: FindOptionsWhere<AuditLog> = {
      userId,
    };

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    const skip = (page - 1) * limit;

    let queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .where(where);

    // Add search filter if provided
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(audit.description ILIKE :search OR audit.entityId = :searchExact)',
        { search: `%${search}%`, searchExact: search }
      );
    }

    const [logs, total] = await queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const data = logs.map(log => this.mapToDto(log));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(
    userId: string,
    entityType: string,
    entityId: string,
  ): Promise<AuditLogDto[]> {
    const logs = await this.auditLogRepository.find({
      where: {
        userId,
        entityType,
        entityId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return logs.map(log => this.mapToDto(log));
  }

  /**
   * Get full history of a transaction with detailed changes
   */
  async getTransactionHistory(
    userId: string,
    transactionId: string,
  ): Promise<AuditLogDto[]> {
    return this.getEntityAuditLogs(userId, 'Transaction', transactionId);
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(data: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get user's recent activity summary
   */
  async getUserActivity(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UserActivityResponseDto> {
    const logs = await this.auditLogRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Group by date
    const activitiesByDate = new Map<string, Map<AuditAction, number>>();

    logs.forEach(log => {
      const dateKey = log.createdAt.toISOString().split('T')[0];

      if (!activitiesByDate.has(dateKey)) {
        activitiesByDate.set(dateKey, new Map());
      }

      const dateActions = activitiesByDate.get(dateKey);
      const currentCount = dateActions.get(log.action) || 0;
      dateActions.set(log.action, currentCount + 1);
    });

    // Convert to response format
    const activities: UserActivityDto[] = Array.from(activitiesByDate.entries())
      .map(([date, actionsMap]) => {
        const actions = Array.from(actionsMap.entries()).map(([action, count]) => ({
          action,
          count,
        }));

        const totalActions = actions.reduce((sum, a) => sum + a.count, 0);

        return {
          date,
          actions,
          totalActions,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      activities,
      totalActions: logs.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }

  /**
   * Map AuditLog entity to DTO with computed changes
   */
  private mapToDto(log: AuditLog): AuditLogDto {
    const changes = this.computeChanges(log.oldValues, log.newValues);

    return {
      id: log.id,
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      changes,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      description: log.description,
      createdAt: log.createdAt,
    };
  }

  /**
   * Compute field-level changes between old and new values
   */
  private computeChanges(
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
  ): Record<string, { before: any; after: any }> {
    const changes: Record<string, { before: any; after: any }> = {};

    if (!oldValues || !newValues) {
      return changes;
    }

    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues),
    ]);

    allKeys.forEach(key => {
      const oldValue = oldValues[key];
      const newValue = newValues[key];

      // Skip if values are the same
      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        return;
      }

      changes[key] = {
        before: oldValue,
        after: newValue,
      };
    });

    return changes;
  }

  /**
   * Create audit log for transaction operations
   */
  async logTransactionChange(
    userId: string,
    action: AuditAction,
    transactionId: string,
    oldValues?: any,
    newValues?: any,
    description?: string,
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      action,
      entityType: 'Transaction',
      entityId: transactionId,
      oldValues,
      newValues,
      description,
    });
  }
}
