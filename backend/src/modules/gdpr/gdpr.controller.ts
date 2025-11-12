import {
  Controller,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { GdprService } from './gdpr.service';
import { DeleteAccountDto } from './dto/delete-account.dto';

@Controller('gdpr')
@UseGuards(JwtAuthGuard)
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  @Throttle({ default: { limit: 1, ttl: 3600000 } }) // 1 request per hour
  async exportUserData(@Req() req: Request) {
    const userId = req.user['sub'];
    return this.gdprService.exportUserData(userId);
  }

  @Delete('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(
    @Req() req: Request,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    const userId = req.user['sub'];
    return this.gdprService.deleteUserAccount(
      userId,
      deleteAccountDto.password,
      deleteAccountDto.reason,
    );
  }
}
