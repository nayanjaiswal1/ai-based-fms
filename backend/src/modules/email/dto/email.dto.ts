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

  @ApiPropertyOptional({ example: 'oauth_token_here' })
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional({ example: 'refresh_token_here' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({ example: 'app_password_here' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 'imap.gmail.com' })
  @IsOptional()
  @IsString()
  imapHost?: string;

  @ApiPropertyOptional({ example: 993 })
  @IsOptional()
  @IsNumber()
  imapPort?: number;
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
