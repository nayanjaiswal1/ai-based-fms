import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

class DashboardPreferencesApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getPreferences(): Promise<DashboardPreferences> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/preferences`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updatePreferences(dto: UpdatePreferencesDto): Promise<DashboardPreferences> {
    const response = await axios.put(`${API_BASE_URL}/dashboard/preferences`, dto, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async resetToDefault(): Promise<DashboardPreferences> {
    const response = await axios.post(
      `${API_BASE_URL}/dashboard/preferences/reset`,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
    return response.data;
  }
}

export const dashboardPreferencesApi = new DashboardPreferencesApi();
