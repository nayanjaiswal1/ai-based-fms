import { IsDateString, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DateRangePreset {
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_365_DAYS = 'last_365_days',
  CUSTOM = 'custom',
}

export class DateRangeQueryDto {
  @ApiPropertyOptional({ enum: DateRangePreset, example: DateRangePreset.THIS_MONTH })
  @IsOptional()
  @IsEnum(DateRangePreset)
  preset?: DateRangePreset;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CategoryAnalyticsQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class AccountAnalyticsQueryDto extends DateRangeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountId?: string;
}
