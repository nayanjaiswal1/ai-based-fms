import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@database/entities';
import { SessionsService } from '@modules/sessions/sessions.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  sessionId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private sessionsService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // First, try to extract from cookie
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
        // Fallback to Authorization header for backward compatibility
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Validate session if sessionId is present
    if (payload.sessionId) {
      const session = await this.sessionsService.getSessionById(payload.sessionId);

      if (!session) {
        throw new UnauthorizedException('Session not found or expired');
      }

      // Update session activity asynchronously (don't await to avoid blocking)
      this.sessionsService.updateSessionActivity(payload.sessionId).catch(() => {});
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionTier: user.subscriptionTier,
      sessionId: payload.sessionId,
    };
  }
}
