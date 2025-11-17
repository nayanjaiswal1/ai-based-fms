import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { ConnectEmailDto, SyncEmailDto, EmailPreferencesDto } from './dto/email.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ParsingStatus } from '@database/entities';

@ApiTags('Email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('gmail/auth-url')
  @ApiOperation({ summary: 'Get Gmail OAuth authorization URL' })
  @ApiResponse({ status: 200, description: 'Returns OAuth URL' })
  getGmailAuthUrl() {
    return this.emailService.getGmailAuthUrl();
  }

  @Post('gmail/callback')
  @ApiOperation({ summary: 'Handle Gmail OAuth callback' })
  @ApiResponse({ status: 201, description: 'Gmail connection created' })
  handleGmailCallback(
    @CurrentUser('id') userId: string,
    @Body('code') code: string,
  ) {
    return this.emailService.handleOAuthCallback(userId, code);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect email account' })
  @ApiResponse({ status: 201, description: 'Email connection created' })
  connectEmail(@CurrentUser('id') userId: string, @Body() connectDto: ConnectEmailDto) {
    return this.emailService.connectEmail(userId, connectDto);
  }

  @Get('connections')
  @ApiOperation({ summary: 'Get all email connections' })
  @ApiResponse({ status: 200, description: 'Returns list of email connections' })
  getConnections(@CurrentUser('id') userId: string) {
    return this.emailService.getConnections(userId);
  }

  @Delete('connections/:connectionId')
  @ApiOperation({ summary: 'Disconnect email account' })
  @ApiResponse({ status: 200, description: 'Email connection disconnected' })
  disconnectEmail(
    @CurrentUser('id') userId: string,
    @Param('connectionId') connectionId: string,
  ) {
    return this.emailService.disconnectEmail(userId, connectionId);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync emails and extract transactions' })
  @ApiResponse({ status: 200, description: 'Email sync completed' })
  syncEmails(@CurrentUser('id') userId: string, @Body() syncDto: SyncEmailDto) {
    return this.emailService.syncEmails(userId, syncDto);
  }

  @Patch('connections/:connectionId/preferences')
  @ApiOperation({ summary: 'Update email sync preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated' })
  updatePreferences(
    @CurrentUser('id') userId: string,
    @Param('connectionId') connectionId: string,
    @Body() preferencesDto: EmailPreferencesDto,
  ) {
    return this.emailService.updatePreferences(userId, connectionId, preferencesDto);
  }

  @Get('connections/:connectionId/status')
  @ApiOperation({ summary: 'Get sync status' })
  @ApiResponse({ status: 200, description: 'Returns sync status' })
  getSyncStatus(
    @CurrentUser('id') userId: string,
    @Param('connectionId') connectionId: string,
  ) {
    return this.emailService.getSyncStatus(userId, connectionId);
  }

  // Email Message Management Endpoints

  @Get('messages')
  @ApiOperation({ summary: 'List emails with parsed data' })
  @ApiResponse({ status: 200, description: 'Returns list of emails with parsed transaction data' })
  listEmails(
    @CurrentUser('id') userId: string,
    @Query('connectionId') connectionId?: string,
    @Query('parsingStatus') parsingStatus?: ParsingStatus,
    @Query('hasTransactions') hasTransactions?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.emailService.listEmails(userId, {
      connectionId,
      parsingStatus,
      hasTransactions: hasTransactions === 'true',
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get('messages/:emailId')
  @ApiOperation({ summary: 'Get email details with parsed data' })
  @ApiResponse({ status: 200, description: 'Returns email with full details' })
  getEmail(
    @CurrentUser('id') userId: string,
    @Param('emailId') emailId: string,
  ) {
    return this.emailService.getEmail(userId, emailId);
  }

  @Post('messages/:emailId/reparse')
  @ApiOperation({ summary: 'Retrigger parsing for a specific email' })
  @ApiResponse({ status: 200, description: 'Email reparsed successfully' })
  reparseEmail(
    @CurrentUser('id') userId: string,
    @Param('emailId') emailId: string,
  ) {
    return this.emailService.reparseEmail(userId, emailId);
  }

  @Patch('messages/:emailId/parsed-data')
  @ApiOperation({ summary: 'Manually update parsed transaction data' })
  @ApiResponse({ status: 200, description: 'Parsed data updated successfully' })
  updateParsedData(
    @CurrentUser('id') userId: string,
    @Param('emailId') emailId: string,
    @Body() updatedData: { transactions?: any[]; orders?: any[] },
  ) {
    return this.emailService.updateParsedData(userId, emailId, updatedData);
  }

  @Delete('messages/:emailId')
  @ApiOperation({ summary: 'Delete email message' })
  @ApiResponse({ status: 200, description: 'Email deleted successfully' })
  deleteEmail(
    @CurrentUser('id') userId: string,
    @Param('emailId') emailId: string,
  ) {
    return this.emailService.deleteEmail(userId, emailId);
  }
}
