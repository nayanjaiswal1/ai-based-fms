import { AuditAction } from '@database/entities/audit-log.entity';

export class AuditLogDto {
  id: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  changes: Record<string, { before: any; after: any }>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  createdAt: Date;
}

export class AuditLogResponseDto {
  data: AuditLogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CreateAuditLogDto {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  description?: string;
}

export class UserActivityDto {
  date: string;
  actions: {
    action: AuditAction;
    count: number;
  }[];
  totalActions: number;
}

export class UserActivityResponseDto {
  activities: UserActivityDto[];
  totalActions: number;
  startDate: string;
  endDate: string;
}
