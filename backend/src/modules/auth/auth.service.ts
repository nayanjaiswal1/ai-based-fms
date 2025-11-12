import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '@database/entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Login2FADto } from './dto/login-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import axios from 'axios';
import { Response } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return {
        requires2FA: true,
        message: 'Please provide your 2FA code',
      };
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async googleOAuth(code: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      });

      const { access_token } = tokenResponse.data;

      // Get user info from Google
      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const { email, name, given_name, family_name, picture } = userInfoResponse.data;

      // Check if user exists
      let user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        // Register new user
        user = this.userRepository.create({
          email,
          firstName: given_name || name?.split(' ')[0] || '',
          lastName: family_name || name?.split(' ').slice(1).join(' ') || '',
          password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
          avatar: picture,
          emailVerified: true, // Google-verified email
        });

        await this.userRepository.save(user);
      } else {
        // Update last login
        user.lastLoginAt = new Date();
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        await this.userRepository.save(user);
      }

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.error_description || 'Google OAuth failed'
      );
    }
  }

  async handleGoogleCallback(code: string, res: Response) {
    try {
      const result = await this.googleOAuth(code);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

      // Redirect to frontend with success message
      const redirectUrl = new URL(frontendUrl);
      redirectUrl.pathname = '/auth/callback/google';
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);

      return res.redirect(redirectUrl.toString());
    } catch (error: any) {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

      // Redirect to frontend with error
      const redirectUrl = new URL(frontendUrl);
      redirectUrl.pathname = '/auth/callback/google';
      redirectUrl.searchParams.set('success', 'false');
      redirectUrl.searchParams.set('error', error.message || 'Authentication failed');

      return res.redirect(redirectUrl.toString());
    }
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, ...sanitized } = user;
    return sanitized;
  }

  // ==================== 2FA Methods ====================

  async enable2FA(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `FMS (${user.email})`,
      length: 32,
    });

    // Save secret temporarily (will be confirmed after verification)
    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan this QR code with your authenticator app and verify with a code',
    };
  }

  async verify2FASetup(userId: string, verify2FADto: Verify2FADto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA setup not initiated');
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: verify2FADto.code,
      window: 2, // Allow 2 time steps before and after
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await this.userRepository.save(user);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      message: '2FA successfully enabled',
      backupCodes,
    };
  }

  async disable2FA(userId: string, verify2FADto: Verify2FADto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: verify2FADto.code,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await this.userRepository.save(user);

    return {
      message: '2FA successfully disabled',
    };
  }

  async login2FA(login2FADto: Login2FADto) {
    const user = await this.userRepository.findOne({
      where: { email: login2FADto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(login2FADto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled for this account');
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: login2FADto.twoFactorCode,
      window: 2,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // ==================== Password Reset Methods ====================

  async requestPasswordReset(passwordResetRequestDto: PasswordResetRequestDto) {
    const user = await this.userRepository.findOne({
      where: { email: passwordResetRequestDto.email },
    });

    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    await this.userRepository.save(user);

    // TODO: Send email with reset link
    // For now, we'll return the token (in production, this should be sent via email)
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    console.log(`Password reset link: ${resetUrl}`);

    return {
      message: 'If an account with that email exists, a password reset link has been sent',
      // TODO: Remove this in production
      resetToken, // Only for development/testing
      resetUrl, // Only for development/testing
    };
  }

  async resetPassword(passwordResetDto: PasswordResetDto) {
    // Find users with non-expired reset tokens
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.passwordResetExpiry > :now', { now: new Date() })
      .andWhere('user.passwordResetToken IS NOT NULL')
      .getMany();

    let matchedUser: User | null = null;

    // Check if token matches any user
    for (const user of users) {
      const isTokenValid = await bcrypt.compare(
        passwordResetDto.token,
        user.passwordResetToken,
      );

      if (isTokenValid) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordResetDto.newPassword, 10);

    // Update password and clear reset token
    matchedUser.password = hashedPassword;
    matchedUser.passwordResetToken = null;
    matchedUser.passwordResetExpiry = null;
    await this.userRepository.save(matchedUser);

    return {
      message: 'Password successfully reset',
    };
  }
}
