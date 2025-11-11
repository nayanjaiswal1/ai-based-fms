import { IsString, IsNumber, IsEnum, IsDateString, IsUUID, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BudgetPeriod, BudgetType } from '@database/entities';

export class CreateBudgetDto {
  @ApiProperty({ example: 'Monthly Groceries Budget' })
  @IsString()
  name: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: BudgetPeriod, example: BudgetPeriod.MONTHLY })
  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @ApiProperty({ enum: BudgetType, example: BudgetType.CATEGORY })
  @IsEnum(BudgetType)
  type: BudgetType;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-01-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  tagId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alertThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBudgetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  alertThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
