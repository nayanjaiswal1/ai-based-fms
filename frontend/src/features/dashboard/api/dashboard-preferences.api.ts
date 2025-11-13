import { api } from '@services/api';

export interface WidgetConfig {
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

export interface DashboardPreferences {
  id: string;
  userId: string;
  widgets: WidgetConfig[];
  gridColumns: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesDto {
  widgets: WidgetConfig[];
  gridColumns?: number;
}

// Using the centralized API client with cookie-based authentication
class DashboardPreferencesApi {
  async getPreferences(): Promise<DashboardPreferences> {
    return api.get('/dashboard/preferences');
  }

  async updatePreferences(dto: UpdatePreferencesDto): Promise<DashboardPreferences> {
    return api.put('/dashboard/preferences', dto);
  }

  async resetToDefault(): Promise<DashboardPreferences> {
    return api.post('/dashboard/preferences/reset', {});
  }
}

export const dashboardPreferencesApi = new DashboardPreferencesApi();
