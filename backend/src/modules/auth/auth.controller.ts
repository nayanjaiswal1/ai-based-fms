import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Login2FADto } from './dto/login-2fa.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';

    // Set access token cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // Only use secure in production (HTTPS)
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    const result = await this.authService.register(registerDto, userAgent, ipAddress);

    // Set httpOnly cookies for tokens
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    // Return user data without tokens
    return {
      user: result.user,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    const result = await this.authService.login(loginDto, userAgent, ipAddress);

    // Handle 2FA case
    if ('requires2FA' in result && result.requires2FA) {
      return result;
    }

    // Set httpOnly cookies for tokens
    if ('accessToken' in result && 'refreshToken' in result) {
      this.setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    // Return user data without tokens
    return {
      user: 'user' in result ? result.user : undefined,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Set new httpOnly cookies
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return {
      message: 'Token refreshed successfully',
    };
  }

  @Public()
  @Get('callback/google')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth code' })
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    return this.authService.handleGoogleCallback(code, res);
  }

  @Public()
  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth login/register' })
  @ApiResponse({ status: 200, description: 'User authenticated via Google' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth code' })
  async googleOAuthPost(
    @Body('code') code: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    const result = await this.authService.googleOAuth(code, userAgent, ipAddress);

    // Set httpOnly cookies for tokens
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    // Return user data without tokens
    return {
      user: result.user,
    };
  }

  // ==================== 2FA Endpoints ====================

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA for user account' })
  @ApiResponse({ status: 200, description: 'Returns QR code and secret for 2FA setup' })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enable2FA(@CurrentUser('id') userId: string) {
    return this.authService.enable2FA(userId);
  }

  @Post('2fa/verify-setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA setup with code from authenticator app' })
  @ApiResponse({ status: 200, description: '2FA successfully enabled, returns backup codes' })
  @ApiResponse({ status: 400, description: '2FA setup not initiated' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code or unauthorized' })
  async verify2FASetup(@CurrentUser('id') userId: string, @Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FASetup(userId, verify2FADto);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA for user account' })
  @ApiResponse({ status: 200, description: '2FA successfully disabled' })
  @ApiResponse({ status: 400, description: '2FA not enabled' })
  @ApiResponse({ status: 401, description: 'Invalid 2FA code or unauthorized' })
  async disable2FA(@CurrentUser('id') userId: string, @Body() verify2FADto: Verify2FADto) {
    return this.authService.disable2FA(userId, verify2FADto);
  }

  @Public()
  @Post('login/2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with 2FA code' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 400, description: '2FA not enabled for account' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or 2FA code' })
  async login2FA(
    @Body() login2FADto: Login2FADto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
    const result = await this.authService.login2FA(login2FADto, userAgent, ipAddress);

    // Set httpOnly cookies for tokens
    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    // Return user data without tokens
    return {
      user: result.user,
    };
  }

  // ==================== Password Reset Endpoints ====================

  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent (if account exists)' })
  async requestPasswordReset(@Body() passwordResetRequestDto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(passwordResetRequestDto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() passwordResetDto: PasswordResetDto) {
    return this.authService.resetPassword(passwordResetDto);
  }

  // ==================== Logout Endpoint ====================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  async logout(@Res({ passthrough: true }) res: Response) {
    // Clear auth cookies
    this.clearAuthCookies(res);

    return {
      message: 'Logged out successfully',
    };
  }
}
