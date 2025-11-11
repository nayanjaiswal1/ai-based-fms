import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { ConnectEmailDto, SyncEmailDto, EmailPreferencesDto } from './dto/email.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

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
}
