import { useState } from 'react';
import { Job } from '../types';
import { useRetryJob, useCancelJob, useCleanJobs, useCheckStuckJobs } from '../hooks/useJobs';
import JobStatistics from '../components/JobStatistics';
import JobList from '../components/JobList';
import JobDetails from '../components/JobDetails';
import QueueControls from '../components/QueueControls';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCleanDialog, setShowCleanDialog] = useState(false);

  const { mutate: retryJob } = useRetryJob();
  const { mutate: cancelJob } = useCancelJob();
  const { mutate: cleanJobs } = useCleanJobs();
  const { mutate: checkStuckJobs } = useCheckStuckJobs();

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const handleRetryJob = (job: Job) => {
    setSelectedJob(job);
    setShowRetryDialog(true);
  };

  const handleCancelJob = (job: Job) => {
    setSelectedJob(job);
    setShowCancelDialog(true);
  };

  const confirmRetry = () => {
    if (selectedJob) {
      retryJob({ id: selectedJob.id, resetAttempts: true });
    }
    setShowRetryDialog(false);
    setSelectedJob(null);
  };

  const confirmCancel = () => {
    if (selectedJob) {
      cancelJob(selectedJob.id);
    }
    setShowCancelDialog(false);
    setSelectedJob(null);
  };

  const handleCleanOldJobs = () => {
    setShowCleanDialog(true);
  };

  const confirmClean = () => {
    cleanJobs({ olderThanDays: 30 });
    setShowCleanDialog(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and manage background jobs and queues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => checkStuckJobs()}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Check Stuck Jobs
          </Button>
          <Button variant="outline" onClick={handleCleanOldJobs}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clean Old Jobs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <JobStatistics />
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <JobList
            onViewDetails={handleViewDetails}
            onRetryJob={handleRetryJob}
            onCancelJob={handleCancelJob}
          />
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <QueueControls />
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <JobDetails job={selectedJob} open={showDetails} onClose={() => setShowDetails(false)} />

      {/* Retry Job Confirmation */}
      <AlertDialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retry Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to retry this job? This will reset the attempt count and
              requeue the job for processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRetry}>Retry</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Job Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Cancel Job</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clean Old Jobs Confirmation */}
      <AlertDialog open={showCleanDialog} onOpenChange={setShowCleanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clean Old Jobs</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all jobs older than 30 days from the database. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClean}>Clean Jobs</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
