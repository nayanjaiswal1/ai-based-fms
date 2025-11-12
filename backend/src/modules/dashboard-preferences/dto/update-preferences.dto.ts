import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WidgetConfig } from '../../../database/entities/user-dashboard-preference.entity';

class WidgetConfigDto implements WidgetConfig {
  id: string;
  type: string;
  position: number;
  size: 'small' | 'medium' | 'large' | 'full-width';
  visible: boolean;
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
