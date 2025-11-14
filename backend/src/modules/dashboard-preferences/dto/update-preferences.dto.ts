import { IsArray, IsNumber, IsOptional, ValidateNested, IsString, IsBoolean, IsIn, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { WidgetConfig } from '../../../database/entities/user-dashboard-preference.entity';

class WidgetConfigDto implements WidgetConfig {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsNumber()
  position: number;

  @IsIn(['small', 'medium', 'large', 'full-width'])
  size: 'small' | 'medium' | 'large' | 'full-width';

  @IsBoolean()
  visible: boolean;

  @IsOptional()
  @IsObject()
  config?: {
    title?: string;
    dateRange?: string;
    filters?: Record<string, any>;
    categories?: string[];
    refreshInterval?: number;
  };
}

export class UpdateDashboardPreferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetConfigDto)
  widgets: WidgetConfig[];

  @IsOptional()
  @IsNumber()
  gridColumns?: number;
}
