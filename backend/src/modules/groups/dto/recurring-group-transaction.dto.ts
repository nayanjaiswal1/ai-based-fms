import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsObject, IsDateString, IsInt, Min, Max } from 'class-validator';
import { SplitType } from '@database/entities';
import { RecurrenceFrequency, RecurrenceStatus } from '@database/entities';

export class CreateRecurringGroupTransactionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  paidBy: string;

  @IsEnum(SplitType)
  splitType: SplitType;

  @IsObject()
  splits: Record<string, number>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxOccurrences?: number;
}

export class UpdateRecurringGroupTransactionDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @IsString()
  @IsOptional()
  paidBy?: string;

  @IsEnum(SplitType)
  @IsOptional()
  splitType?: SplitType;

  @IsObject()
  @IsOptional()
  splits?: Record<string, number>;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(RecurrenceFrequency)
  @IsOptional()
  frequency?: RecurrenceFrequency;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxOccurrences?: number;

  @IsEnum(RecurrenceStatus)
  @IsOptional()
  status?: RecurrenceStatus;
}
