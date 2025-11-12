import api from '@/lib/api';
import {
  Report,
  GeneratedReport,
  ReportTemplate,
  CreateReportDto,
  UpdateReportDto,
  GenerateReportDto,
  QueryReportsDto,
  ReportData,
} from '../types';

export const reportsApi = {
  // Report CRUD operations
  async getReports(query?: QueryReportsDto): Promise<{ reports: Report[]; total: number }> {
    const response = await api.get('/reports', { params: query });
    return response.data;
  },

  async getReport(id: string): Promise<Report> {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await api.post('/reports', data);
    return response.data;
  },

  async updateReport(id: string, data: UpdateReportDto): Promise<Report> {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },

  async deleteReport(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  },

  async duplicateReport(id: string): Promise<Report> {
    const response = await api.post(`/reports/${id}/duplicate`);
    return response.data;
  },

  async toggleFavorite(id: string): Promise<Report> {
    const response = await api.post(`/reports/${id}/favorite`);
    return response.data;
  },

  // Report generation
  async generateReport(id: string, data: GenerateReportDto): Promise<GeneratedReport> {
    const response = await api.post(`/reports/${id}/generate`, data);
    return response.data;
  },

  async previewReport(id: string): Promise<ReportData> {
    const response = await api.get(`/reports/${id}/preview`);
    return response.data;
  },

  // Generated reports
  async getGeneratedReports(reportId: string): Promise<GeneratedReport[]> {
    const response = await api.get(`/reports/${reportId}/generated`);
    return response.data;
  },

  async getGeneratedReport(id: string): Promise<GeneratedReport> {
    const response = await api.get(`/reports/generated/${id}`);
    return response.data;
  },

  async downloadGeneratedReport(id: string): Promise<Blob> {
    const response = await api.get(`/reports/generated/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteGeneratedReport(id: string): Promise<void> {
    await api.delete(`/reports/generated/${id}`);
  },

  // Templates
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await api.get('/reports/templates');
    return response.data;
  },

  async getTemplate(type: string): Promise<ReportTemplate> {
    const response = await api.get(`/reports/templates/${type}`);
    return response.data;
  },

  async createFromTemplate(type: string, name?: string): Promise<Report> {
    const response = await api.post(`/reports/templates/${type}`, { name });
    return response.data;
  },
};
