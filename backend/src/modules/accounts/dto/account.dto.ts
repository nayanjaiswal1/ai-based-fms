import { IsString, IsNumber, IsEnum, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '../../../database/entities/account.entity';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name', maxLength: 100 })
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ enum: AccountType, description: 'Type of account' })
  @IsEnum(AccountType, { message: 'Type must be a valid account type' })
  type: AccountType;

  @ApiProperty({ description: 'Initial balance', minimum: 0 })
  @IsNumber({}, { message: 'Balance must be a number' })
  balance: number;

  @ApiPropertyOptional({ description: 'Account currency code', maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3, { message: 'Currency code must be 3 characters' })
  currency?: string;

  @ApiPropertyOptional({ description: 'Bank or institution name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  institution?: string;

  @ApiPropertyOptional({ description: 'Account number (last 4 digits)', maxLength: 4 })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Account description or notes', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ description: 'Account name', maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({ enum: AccountType, description: 'Type of account' })
  @IsOptional()
  @IsEnum(AccountType, { message: 'Type must be a valid account type' })
  type?: AccountType;

  @ApiPropertyOptional({ description: 'Account balance', minimum: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'Balance must be a number' })
  balance?: number;

  @ApiPropertyOptional({ description: 'Account currency code', maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3, { message: 'Currency code must be 3 characters' })
  currency?: string;

  @ApiPropertyOptional({ description: 'Bank or institution name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  institution?: string;

  @ApiPropertyOptional({ description: 'Account number (last 4 digits)', maxLength: 4 })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Account description or notes', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
