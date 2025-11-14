import { Controller, Get, Query, Param, UseGuards, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditFiltersDto } from './dto/audit-filters.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /audit - Get all audit logs for the authenticated user
   */
  @Get()
  async getAuditLogs(@Request() req, @Query() filters: AuditFiltersDto) {
    return this.auditService.getAuditLogs(req.user.userId, filters);
  }

  /**
   * GET /audit/entity/:entity/:entityId - Get logs for a specific entity
   */
  @Get('entity/:entity/:entityId')
  async getEntityAuditLogs(
    @Request() req,
    @Param('entity') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityAuditLogs(req.user.userId, entityType, entityId);
  }

  /**
   * GET /audit/transaction/:transactionId/history - Get transaction history
   */
  @Get('transaction/:transactionId/history')
  async getTransactionHistory(@Request() req, @Param('transactionId') transactionId: string) {
    return this.auditService.getTransactionHistory(req.user.userId, transactionId);
  }

  /**
   * GET /audit/activity - Get user activity summary
   */
  @Get('activity')
  async getUserActivity(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
    const end = endDate ? new Date(endDate) : new Date(); // Default: now

    return this.auditService.getUserActivity(req.user.userId, start, end);
  }
}
