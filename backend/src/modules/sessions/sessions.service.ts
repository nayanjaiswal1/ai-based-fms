import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Session, DeviceInfo } from '@database/entities';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import * as UAParser from 'ua-parser-js';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  /**
   * Create a new session on login
   */
  async createSession(
    userId: string,
    userAgent: string,
    ipAddress: string,
    refreshToken: string,
  ): Promise<Session> {
    const deviceInfo = this.parseUserAgent(userAgent);

    const session = this.sessionRepository.create({
      userId,
      deviceInfo,
      ipAddress,
      location: null, // Can be enhanced with IP geolocation service
      lastActive: new Date(),
      isActive: true,
      refreshToken,
    });

    return this.sessionRepository.save(session);
  }

  /**
   * Get all active sessions for a user
   */
  async getActiveSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActive: 'DESC' },
    });

    return sessions.map((session) =>
      this.toResponseDto(session, session.id === currentSessionId),
    );
  }

  /**
   * Get a specific session by ID
   */
  async getSessionById(sessionId: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { id: sessionId, isActive: true },
    });
  }

  /**
   * Get a session by refresh token
   */
  async getSessionByRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { refreshToken, isActive: true },
    });
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== userId) {
      throw new UnauthorizedException('You can only revoke your own sessions');
    }

    session.isActive = false;
    await this.sessionRepository.save(session);
  }

  /**
   * Revoke all sessions except the current one
   */
  async revokeAllSessions(
    userId: string,
    exceptSessionId?: string,
  ): Promise<number> {
    const sessions = await this.sessionRepository.find({
      where: { userId, isActive: true },
    });

    const sessionsToRevoke = sessions.filter(
      (session) => session.id !== exceptSessionId,
    );

    for (const session of sessionsToRevoke) {
      session.isActive = false;
    }

    await this.sessionRepository.save(sessionsToRevoke);

    return sessionsToRevoke.length;
  }

  /**
   * Update session activity timestamp
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActive: new Date(),
    });
  }

  /**
   * Update session refresh token
   */
  async updateSessionRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      refreshToken,
    });
  }

  /**
   * Cleanup expired sessions (inactive for more than X days)
   */
  async cleanupExpiredSessions(daysInactive: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    const expiredSessions = await this.sessionRepository.find({
      where: {
        lastActive: LessThan(cutoffDate),
        isActive: true,
      },
    });

    for (const session of expiredSessions) {
      session.isActive = false;
    }

    await this.sessionRepository.save(expiredSessions);

    return expiredSessions.length;
  }

  /**
   * Parse user agent string to extract device information
   */
  private parseUserAgent(userAgent: string): DeviceInfo {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      browser: result.browser.name || 'Unknown',
      browserVersion: result.browser.version || 'Unknown',
      os: result.os.name || 'Unknown',
      osVersion: result.os.version || 'Unknown',
      deviceType: this.determineDeviceType(result.device.type),
    };
  }

  /**
   * Determine device type from UAParser device type
   */
  private determineDeviceType(
    deviceType?: string,
  ): 'Desktop' | 'Mobile' | 'Tablet' {
    if (!deviceType) return 'Desktop';

    if (deviceType === 'mobile') return 'Mobile';
    if (deviceType === 'tablet') return 'Tablet';

    return 'Desktop';
  }

  /**
   * Convert Session entity to response DTO
   */
  private toResponseDto(
    session: Session,
    isCurrent: boolean = false,
  ): SessionResponseDto {
    return {
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      lastActive: session.lastActive,
      createdAt: session.createdAt,
      isActive: session.isActive,
      isCurrent,
    };
  }
}
