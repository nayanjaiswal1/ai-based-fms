import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../api/jobs.api';
import { JobQuery, QueueAction } from '../types';
import { toast } from 'sonner';

export const useJobs = (query: JobQuery) => {
  return useQuery({
    queryKey: ['jobs', query],
    queryFn: () => jobsApi.getJobs(query),
  });
};

export const useJobById = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getJobById(id),
    enabled: !!id,
  });
};

export const useJobLogs = (id: string) => {
  return useQuery({
    queryKey: ['job-logs', id],
    queryFn: () => jobsApi.getJobLogs(id),
    enabled: !!id,
    refetchInterval: 5000, // Refresh logs every 5 seconds
  });
};

export const useJobStatistics = () => {
  return useQuery({
    queryKey: ['job-statistics'],
    queryFn: () => jobsApi.getStatistics(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

export const useQueueStatus = (queueName: string) => {
  return useQuery({
    queryKey: ['queue-status', queueName],
    queryFn: () => jobsApi.getQueueStatus(queueName),
    enabled: !!queueName,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

export const useQueues = () => {
  return useQuery({
    queryKey: ['queues'],
    queryFn: () => jobsApi.getQueues(),
  });
};

export const useRetryJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resetAttempts }: { id: string; resetAttempts?: boolean }) =>
      jobsApi.retryJob(id, resetAttempts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-statistics'] });
      toast.success('Job retried successfully');
    },
    onError: () => {
      toast.error('Failed to retry job');
    },
  });
};

export const useCancelJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsApi.cancelJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-statistics'] });
      toast.success('Job cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel job');
    },
  });
};

export const useControlQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      queueName,
      action,
      grace,
    }: {
      queueName: string;
      action: QueueAction;
      grace?: number;
    }) => jobsApi.controlQueue(queueName, action, grace),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['queue-status', variables.queueName] });
      toast.success(`Queue ${variables.action} successful`);
    },
    onError: () => {
      toast.error('Failed to control queue');
    },
  });
};

export const useCleanJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ olderThanDays, status }: { olderThanDays?: number; status?: string }) =>
      jobsApi.cleanJobs(olderThanDays, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-statistics'] });
      toast.success('Jobs cleaned successfully');
    },
    onError: () => {
      toast.error('Failed to clean jobs');
    },
  });
};

export const useCheckStuckJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => jobsApi.checkStuckJobs(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-statistics'] });
      toast.success('Stuck jobs check completed');
    },
    onError: () => {
      toast.error('Failed to check stuck jobs');
    },
  });
};
