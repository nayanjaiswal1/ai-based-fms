import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { SessionResponseDto } from './dto/session-response.dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  /**
   * Get all active sessions for the current user
   */
  @Get()
  async getActiveSessions(@Request() req): Promise<SessionResponseDto[]> {
    const userId = req.user.id;
    const currentSessionId = req.user.sessionId;

    return this.sessionsService.getActiveSessions(userId, currentSessionId);
  }

  /**
   * Revoke a specific session
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Param('id') sessionId: string, @Request() req): Promise<void> {
    const userId = req.user.id;

    // Prevent revoking current session
    if (sessionId === req.user.sessionId) {
      throw new Error('Cannot revoke current session. Please logout instead.');
    }

    await this.sessionsService.revokeSession(sessionId, userId);
  }

  /**
   * Revoke all sessions except the current one
   */
  @Delete()
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(@Request() req): Promise<{ message: string; count: number }> {
    const userId = req.user.id;
    const currentSessionId = req.user.sessionId;

    const count = await this.sessionsService.revokeAllSessions(userId, currentSessionId);

    return {
      message: `Successfully revoked ${count} session(s)`,
      count,
    };
  }
}
