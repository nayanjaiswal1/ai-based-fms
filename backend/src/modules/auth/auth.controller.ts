import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token successfully refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Get('callback/google')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth code' })
  async googleCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const result = await this.authService.googleOAuth(code);

      // Redirect to frontend with success message
      const redirectUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173');
      redirectUrl.pathname = '/auth/callback/google';
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('accessToken', result.accessToken);
      redirectUrl.searchParams.set('refreshToken', result.refreshToken);

      return res.redirect(redirectUrl.toString());
    } catch (error) {
      // Redirect to frontend with error
      const redirectUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173');
      redirectUrl.pathname = '/auth/callback/google';
      redirectUrl.searchParams.set('success', 'false');
      redirectUrl.searchParams.set('error', error.message || 'Authentication failed');

      return res.redirect(redirectUrl.toString());
    }
  }

  @Public()
  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth login/register' })
  @ApiResponse({ status: 200, description: 'User authenticated via Google' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth code' })
  async googleOAuthPost(@Body('code') code: string) {
    return this.authService.googleOAuth(code);
  }
}
