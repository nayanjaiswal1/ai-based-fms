import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, IsInt, IsDateString, Min, Max } from 'class-validator';
import { GroupBudgetPeriod } from '@database/entities';

export class CreateGroupBudgetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(GroupBudgetPeriod)
  period: GroupBudgetPeriod;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  notifyWhenExceeded?: boolean;

  @IsInt()
  @IsOptional()
  @Min(50)
  @Max(100)
  warningThreshold?: number;
}

export class UpdateGroupBudgetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  amount?: number;

  @IsEnum(GroupBudgetPeriod)
  @IsOptional()
  period?: GroupBudgetPeriod;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyWhenExceeded?: boolean;

  @IsInt()
  @IsOptional()
  @Min(50)
  @Max(100)
  warningThreshold?: number;
}
