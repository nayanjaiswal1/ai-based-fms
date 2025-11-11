import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '@database/entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import axios from 'axios';
import { Response } from 'express';

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
}
