import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ReportFormat } from '@database/entities/generated-report.entity';

export class GenerateReportDto {
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @IsOptional()
  @IsString()
  emailTo?: string;

  @IsOptional()
  @IsObject()
  overrideConfig?: Record<string, any>;
}
