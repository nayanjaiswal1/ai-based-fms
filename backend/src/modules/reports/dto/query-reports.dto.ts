import { IsOptional, IsEnum, IsBoolean, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType } from '@database/entities/report.entity';

export class QueryReportsDto {
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isShared?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
