import api from '@/services/api';
import {
  Job,
  JobLog,
  JobStatistics,
  QueueStatus,
  JobQuery,
  QueueAction,
} from '../types';

export const jobsApi = {
  // Get jobs with filtering and pagination
  getJobs: async (query: JobQuery) => {
    const response = await api.get('/job-monitor/jobs', { params: query });
    return response.data;
  },

  // Get job by ID
  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get(`/job-monitor/jobs/${id}`);
    return response.data;
  },

  // Get job logs
  getJobLogs: async (id: string): Promise<JobLog[]> => {
    const response = await api.get(`/job-monitor/jobs/${id}/logs`);
    return response.data;
  },

  // Get job statistics
  getStatistics: async (): Promise<JobStatistics> => {
    const response = await api.get('/job-monitor/statistics');
    return response.data;
  },

  // Retry a failed job
  retryJob: async (id: string, resetAttempts: boolean = true) => {
    const response = await api.post(`/job-monitor/jobs/${id}/retry`, {
      resetAttempts,
    });
    return response.data;
  },

  // Cancel a job
  cancelJob: async (id: string) => {
    const response = await api.delete(`/job-monitor/jobs/${id}`);
    return response.data;
  },

  // Get queue status
  getQueueStatus: async (queueName: string): Promise<QueueStatus> => {
    const response = await api.get(`/job-monitor/queues/${queueName}/status`);
    return response.data;
  },

  // Control queue
  controlQueue: async (
    queueName: string,
    action: QueueAction,
    grace?: number,
  ) => {
    const response = await api.post(`/job-monitor/queues/${queueName}/control`, {
      action,
      grace,
    });
    return response.data;
  },

  // Clean old jobs
  cleanJobs: async (olderThanDays: number = 30, status?: string) => {
    const response = await api.post('/job-monitor/jobs/clean', {
      olderThanDays,
      status,
    });
    return response.data;
  },

  // Check for stuck jobs
  checkStuckJobs: async () => {
    const response = await api.post('/job-monitor/jobs/check-stuck');
    return response.data;
  },

  // Get available queues
  getQueues: async () => {
    const response = await api.get('/job-monitor/queues');
    return response.data;
  },
};
