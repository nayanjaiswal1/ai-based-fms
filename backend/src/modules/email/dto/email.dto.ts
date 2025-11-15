import { IsString, IsEnum, IsOptional, IsEmail, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailProvider } from '@database/entities';

export class ConnectEmailDto {
  @ApiProperty({ enum: EmailProvider, example: EmailProvider.GMAIL })
  @IsEnum(EmailProvider)
  provider: EmailProvider;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'oauth_access_token_here' })
  @IsString()
  accessToken: string;

  @ApiPropertyOptional({ example: 'oauth_refresh_token_here' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  tokenExpiresAt?: Date;
}

export class SyncEmailDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  connectionId: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  daysBack?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoExtract?: boolean;
}

export class EmailPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  syncIntervalMinutes?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  notifyOnNewTransactions?: boolean;

  @ApiPropertyOptional({ example: ['bank', 'receipt', 'invoice'] })
  @IsOptional()
  keywords?: string[];
}
