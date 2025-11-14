import { IsString, IsNumber, IsEnum, IsDate, IsOptional, Min, MaxLength, IsUUID, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, description: 'Type of transaction' })
  @IsEnum(TransactionType, { message: 'Type must be one of: income, expense, transfer' })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction amount', minimum: 0.01 })
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({ description: 'Transaction description', maxLength: 200 })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description must not exceed 200 characters' })
  description: string;

  @ApiProperty({ description: 'Transaction date' })
  @IsDate({ message: 'Date must be a valid date' })
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'Account ID', format: 'uuid' })
  @IsUUID('4', { message: 'Account ID must be a valid UUID' })
  accountId: string;

  @ApiPropertyOptional({ description: 'Category ID', format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Transaction notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Location where transaction occurred' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [String] })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ enum: TransactionType, description: 'Type of transaction' })
  @IsOptional()
  @IsEnum(TransactionType, { message: 'Type must be one of: income, expense, transfer' })
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'Transaction amount', minimum: 0.01 })
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount?: number;

  @ApiPropertyOptional({ description: 'Transaction description', maxLength: 200 })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(200, { message: 'Description must not exceed 200 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Transaction date' })
  @IsOptional()
  @IsDate({ message: 'Date must be a valid date' })
  @Type(() => Date)
  date?: Date;

  @ApiPropertyOptional({ description: 'Account ID', format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'Account ID must be a valid UUID' })
  accountId?: string;

  @ApiPropertyOptional({ description: 'Category ID', format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID' })
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Transaction notes' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Location where transaction occurred' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @ApiPropertyOptional({ description: 'Tag IDs', type: [String] })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class GetStatsDto {
  @ApiProperty({ description: 'Start date for stats', example: '2025-01-01' })
  @IsString({ message: 'Start date must be a string in ISO format' })
  startDate: string;

  @ApiProperty({ description: 'End date for stats', example: '2025-12-31' })
  @IsString({ message: 'End date must be a string in ISO format' })
  endDate: string;
}
