import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ExportTransactionsDto } from './dto/export-transactions.dto';
import { ExportBudgetsDto } from './dto/export-budgets.dto';
import { ExportAnalyticsDto } from './dto/export-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Export')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 exports per hour
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  // ==================== Transaction Exports ====================

  @Post('transactions/csv')
  @ApiOperation({ summary: 'Export transactions to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated successfully' })
  async exportTransactionsCSV(
    @Request() req,
    @Body() filters: ExportTransactionsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportTransactionsCSV(
        req.user.userId,
        filters,
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export transactions to CSV',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('transactions/excel')
  @ApiOperation({ summary: 'Export transactions to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  async exportTransactionsExcel(
    @Request() req,
    @Body() filters: ExportTransactionsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportTransactionsExcel(
        req.user.userId,
        filters,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export transactions to Excel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('transactions/pdf')
  @ApiOperation({ summary: 'Export transactions to PDF' })
  @ApiResponse({ status: 200, description: 'PDF file generated successfully' })
  async exportTransactionsPDF(
    @Request() req,
    @Body() filters: ExportTransactionsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportTransactionsPDF(
        req.user.userId,
        filters,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export transactions to PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== Budget Exports ====================

  @Post('budgets/csv')
  @ApiOperation({ summary: 'Export budgets to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated successfully' })
  async exportBudgetsCSV(
    @Request() req,
    @Body() filters: ExportBudgetsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportBudgetsCSV(
        req.user.userId,
        filters,
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export budgets to CSV',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('budgets/excel')
  @ApiOperation({ summary: 'Export budgets to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  async exportBudgetsExcel(
    @Request() req,
    @Body() filters: ExportBudgetsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportBudgetsExcel(
        req.user.userId,
        filters,
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export budgets to Excel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('budgets/pdf')
  @ApiOperation({ summary: 'Export budgets to PDF' })
  @ApiResponse({ status: 200, description: 'PDF file generated successfully' })
  async exportBudgetsPDF(
    @Request() req,
    @Body() filters: ExportBudgetsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportBudgetsPDF(
        req.user.userId,
        filters,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export budgets to PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== Analytics Exports ====================

  @Post('analytics/csv')
  @ApiOperation({ summary: 'Export analytics data to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated successfully' })
  async exportAnalyticsCSV(
    @Request() req,
    @Body() filters: ExportAnalyticsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportAnalyticsCSV(
        req.user.userId,
        filters,
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export analytics to CSV',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('analytics/pdf')
  @ApiOperation({ summary: 'Export analytics report to PDF with charts' })
  @ApiResponse({ status: 200, description: 'PDF file generated successfully' })
  async exportAnalyticsPDF(
    @Request() req,
    @Body() filters: ExportAnalyticsDto,
    @Res() res: Response,
  ) {
    try {
      const { buffer, filename } = await this.exportService.exportAnalyticsPDF(
        req.user.userId,
        filters,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export analytics to PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== Account Exports ====================

  @Post('accounts/csv')
  @ApiOperation({ summary: 'Export accounts summary to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated successfully' })
  async exportAccountsCSV(@Request() req, @Res() res: Response) {
    try {
      const { buffer, filename } = await this.exportService.exportAccountsCSV(
        req.user.userId,
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export accounts to CSV',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('accounts/pdf')
  @ApiOperation({ summary: 'Export accounts report to PDF' })
  @ApiResponse({ status: 200, description: 'PDF file generated successfully' })
  async exportAccountsPDF(@Request() req, @Res() res: Response) {
    try {
      const { buffer, filename } = await this.exportService.exportAccountsPDF(
        req.user.userId,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      throw new HttpException(
        'Failed to export accounts to PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
