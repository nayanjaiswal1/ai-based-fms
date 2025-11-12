import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ReconciliationService } from './reconciliation.service';
import {
  StartReconciliationDto,
  UploadStatementDto,
  MatchTransactionDto,
  UnmatchTransactionDto,
  CompleteReconciliationDto,
  AdjustBalanceDto,
} from './dto';

@Controller('reconciliations')
@UseGuards(JwtAuthGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startReconciliation(@Request() req, @Body() dto: StartReconciliationDto) {
    return this.reconciliationService.startReconciliation(req.user.userId, dto);
  }

  @Post(':id/upload-statement')
  @HttpCode(HttpStatus.OK)
  async uploadStatement(
    @Request() req,
    @Param('id') reconciliationId: string,
    @Body() dto: UploadStatementDto,
  ) {
    return this.reconciliationService.uploadStatement(req.user.userId, reconciliationId, dto);
  }

  @Get(':id')
  async getReconciliation(@Request() req, @Param('id') reconciliationId: string) {
    return this.reconciliationService.getReconciliation(req.user.userId, reconciliationId);
  }

  @Post(':id/match')
  @HttpCode(HttpStatus.OK)
  async matchTransaction(
    @Request() req,
    @Param('id') reconciliationId: string,
    @Body() dto: MatchTransactionDto,
  ) {
    return this.reconciliationService.matchTransaction(req.user.userId, reconciliationId, dto);
  }

  @Post(':id/unmatch')
  @HttpCode(HttpStatus.OK)
  async unmatchTransaction(
    @Request() req,
    @Param('id') reconciliationId: string,
    @Body() dto: UnmatchTransactionDto,
  ) {
    return this.reconciliationService.unmatchTransaction(req.user.userId, reconciliationId, dto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async completeReconciliation(
    @Request() req,
    @Param('id') reconciliationId: string,
    @Body() dto: CompleteReconciliationDto,
  ) {
    return this.reconciliationService.completeReconciliation(req.user.userId, reconciliationId, dto);
  }

  @Delete(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelReconciliation(@Request() req, @Param('id') reconciliationId: string) {
    return this.reconciliationService.cancelReconciliation(req.user.userId, reconciliationId);
  }

  @Get('history/:accountId')
  async getReconciliationHistory(@Request() req, @Param('accountId') accountId: string) {
    return this.reconciliationService.getReconciliationHistory(req.user.userId, accountId);
  }

  @Post(':id/adjust-balance')
  @HttpCode(HttpStatus.OK)
  async adjustBalance(
    @Request() req,
    @Param('id') reconciliationId: string,
    @Body() dto: AdjustBalanceDto,
  ) {
    return this.reconciliationService.adjustBalance(req.user.userId, reconciliationId, dto);
  }
}
