import { IsOptional, IsDateString, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum InsightType {
  SPENDING = 'spending',
  BUDGET = 'budget',
  SAVINGS = 'savings',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  HEALTH = 'health',
  PREDICTION = 'prediction',
}

export class InsightsOptionsDto {
  @ApiPropertyOptional({ description: 'Start date for insights analysis (ISO format)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for insights analysis (ISO format)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Types of insights to generate',
    enum: InsightType,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(InsightType, { each: true })
  types?: InsightType[];

  @ApiPropertyOptional({ description: 'Use AI for advanced insights' })
  @IsOptional()
  @IsBoolean()
  useAI?: boolean;

  @ApiPropertyOptional({ description: 'Include predictions' })
  @IsOptional()
  @IsBoolean()
  includePredictions?: boolean;
}
