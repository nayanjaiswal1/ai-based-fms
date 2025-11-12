import { IsOptional, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportAnalyticsDto {
  @ApiPropertyOptional({ description: 'Start date for analytics (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Account ID for filtering' })
  @IsOptional()
  @IsString()
  accountId?: string;

  @ApiPropertyOptional({ description: 'Include charts in PDF export' })
  @IsOptional()
  includeCharts?: boolean;
}
