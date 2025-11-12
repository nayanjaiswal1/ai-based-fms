import { IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportBudgetsDto {
  @ApiPropertyOptional({ description: 'Start date for filtering (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by category IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Include only active budgets' })
  @IsOptional()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Include only exceeded budgets' })
  @IsOptional()
  exceededOnly?: boolean;
}
