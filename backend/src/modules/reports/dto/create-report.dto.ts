import { IsString, IsEnum, IsObject, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportType, ReportConfig, ReportSchedule } from '@database/entities/report.entity';

export class CreateReportDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsObject()
  config: ReportConfig;

  @IsOptional()
  @IsObject()
  schedule?: ReportSchedule;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;

  @IsOptional()
  @IsString({ each: true })
  sharedWithGroupIds?: string[];
}
