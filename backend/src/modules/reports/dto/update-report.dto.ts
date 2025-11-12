import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ReportType, ReportConfig, ReportSchedule } from '@database/entities/report.entity';

export class UpdateReportDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @IsOptional()
  @IsObject()
  config?: ReportConfig;

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
