import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsEmail,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SharedExpenseType,
  DebtDirection,
  ParticipantRole,
  SharedExpenseSplitType,
} from '@database/entities';

export class CreatePersonalDebtDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  otherPersonName: string;

  @IsOptional()
  @IsEmail()
  otherPersonEmail?: string;

  @IsOptional()
  @IsString()
  otherPersonPhone?: string;

  @IsEnum(DebtDirection)
  debtDirection: DebtDirection;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class CreateGroupExpenseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(SharedExpenseType)
  type: SharedExpenseType;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  participantUserIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantEmails?: string[];
}

export class AddTransactionDto {
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  paidBy: string; // participantId or userId

  @IsEnum(SharedExpenseSplitType)
  splitType: SharedExpenseSplitType;

  @IsOptional()
  splits?: Record<string, number>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdateSharedExpenseGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
