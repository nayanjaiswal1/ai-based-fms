import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@services/api';
import {
  Report,
  GeneratedReport,
  ReportTemplate,
  CreateReportDto,
  UpdateReportDto,
  GenerateReportDto,
  QueryReportsDto,
} from '../types';
import { toast } from 'sonner';

export const useReports = (query?: QueryReportsDto) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reports', query],
    queryFn: () => reportsApi.getReports(query),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateReportDto) => reportsApi.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create report');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportDto }) =>
      reportsApi.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update report');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => reportsApi.duplicateReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate report');
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update favorite status');
    },
  });

  return {
    reports: data?.reports || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    createReport: createMutation.mutate,
    updateReport: updateMutation.mutate,
    deleteReport: deleteMutation.mutate,
    duplicateReport: duplicateMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useReport = (id: string) => {
  const queryClient = useQueryClient();

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.getReport(id),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateReportDto) => reportsApi.generateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generatedReports', id] });
      toast.success('Report generation started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    },
  });

  const previewQuery = useQuery({
    queryKey: ['reportPreview', id],
    queryFn: () => reportsApi.previewReport(id),
    enabled: false, // Manual trigger
  });

  return {
    report,
    isLoading,
    error,
    refetch,
    generateReport: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    preview: previewQuery.data,
    loadPreview: previewQuery.refetch,
    isLoadingPreview: previewQuery.isFetching,
  };
};

export const useGeneratedReports = (reportId: string) => {
  const queryClient = useQueryClient();

  const {
    data: generatedReports,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['generatedReports', reportId],
    queryFn: () => reportsApi.getGeneratedReports(reportId),
    enabled: !!reportId,
    refetchInterval: (query) => {
      // Auto-refresh if there are pending/generating reports
      const hasPending = query.state.data?.some(
        (r: GeneratedReport) => r.status === 'pending' || r.status === 'generating'
      );
      return hasPending ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.deleteGeneratedReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generatedReports', reportId] });
      toast.success('Generated report deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete generated report');
    },
  });

  const downloadReport = async (id: string, fileName: string) => {
    try {
      const blob = await reportsApi.downloadGeneratedReport(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download report');
    }
  };

  return {
    generatedReports: generatedReports || [],
    isLoading,
    error,
    refetch,
    deleteGeneratedReport: deleteMutation.mutate,
    downloadReport,
    isDeleting: deleteMutation.isPending,
  };
};

export const useReportTemplates = () => {
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['reportTemplates'],
    queryFn: () => reportsApi.getTemplates(),
  });

  const queryClient = useQueryClient();

  const createFromTemplateMutation = useMutation({
    mutationFn: ({ type, name }: { type: string; name?: string }) =>
      reportsApi.createFromTemplate(type, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report created from template');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create report from template');
    },
  });

  return {
    templates: templates || [],
    isLoading,
    error,
    createFromTemplate: createFromTemplateMutation.mutate,
    isCreating: createFromTemplateMutation.isPending,
  };
};
