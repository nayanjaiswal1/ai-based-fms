import { useQueues, useQueueStatus, useControlQueue } from '../hooks/useJobs';
import { QueueAction } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pause, Play, Trash2, Loader2 } from 'lucide-react';
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
import { useState } from 'react';

export default function QueueControls() {
  const { data: queues, isLoading } = useQueues();
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [showCleanDialog, setShowCleanDialog] = useState(false);
  const { mutate: controlQueue, isPending } = useControlQueue();

  const handlePauseResume = (queueName: string, isPaused: boolean) => {
    controlQueue({
      queueName,
      action: isPaused ? QueueAction.RESUME : QueueAction.PAUSE,
    });
  };

  const handleClean = (queueName: string) => {
    setSelectedQueue(queueName);
    setShowCleanDialog(true);
  };

  const confirmClean = () => {
    if (selectedQueue) {
      controlQueue({
        queueName: selectedQueue,
        action: QueueAction.CLEAN,
        grace: 24 * 60 * 60 * 1000, // Clean jobs older than 24 hours
      });
    }
    setShowCleanDialog(false);
    setSelectedQueue('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Queue Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {queues?.queues.map((queue: any) => (
              <QueueStatus
                key={queue.name}
                queueName={queue.name}
                description={queue.description}
                onPauseResume={handlePauseResume}
                onClean={handleClean}
                isPending={isPending}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showCleanDialog} onOpenChange={setShowCleanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clean Queue</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all completed and failed jobs older than 24 hours from the queue.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClean}>Clean Queue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface QueueStatusProps {
  queueName: string;
  description: string;
  onPauseResume: (queueName: string, isPaused: boolean) => void;
  onClean: (queueName: string) => void;
  isPending: boolean;
}

function QueueStatus({
  queueName,
  description,
  onPauseResume,
  onClean,
  isPending,
}: QueueStatusProps) {
  const { data: status, isLoading } = useQueueStatus(queueName);

  if (isLoading || !status) {
    return (
      <div className="flex items-center justify-center h-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium">{queueName}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant={status.isPaused ? 'secondary' : 'default'}>
          {status.isPaused ? 'Paused' : 'Active'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Waiting</p>
          <p className="text-lg font-semibold">{status.counts.waiting}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-lg font-semibold">{status.counts.active}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-semibold">{status.counts.failed}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPauseResume(queueName, status.isPaused)}
          disabled={isPending}
        >
          {status.isPaused ? (
            <>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onClean(queueName)}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clean
        </Button>
      </div>
    </div>
  );
}
