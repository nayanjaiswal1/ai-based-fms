import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailApi } from '@services/api';
import { Plus, Mail, RefreshCw, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import EmailModal from '../../email/components/EmailModal';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function EmailTab() {
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: connections, isLoading } = useQuery({
    queryKey: ['email-connections'],
    queryFn: emailApi.getConnections,
  });

  const disconnectMutation = useMutation({
    mutationFn: emailApi.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: emailApi.sync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-connections'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleDisconnect = async (id: string) => {
    confirm({
      title: 'Disconnect Email',
      message: 'Are you sure you want to disconnect this email account? You can reconnect it later.',
      variant: 'warning',
      confirmLabel: 'Disconnect',
      onConfirm: async () => {
        await disconnectMutation.mutateAsync(id);
      },
    });
  };

  const handleSync = async (id: string) => {
    await syncMutation.mutateAsync(id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'syncing':
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'syncing':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Email Transaction Import</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your email to automatically import transactions from receipts and confirmations
        </p>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Mail className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">How Email Import Works</p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li>• Connect your Gmail, Outlook, or Yahoo account</li>
              <li>• We scan your inbox for transaction receipts and confirmations</li>
              <li>• Purchases, bills, and payments are automatically extracted</li>
              <li>• Sync manually or schedule automatic imports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Connect Email Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Connect Email Account
        </button>
      </div>

      {/* Connected Accounts */}
      {isLoading ? (
        <div className="rounded-lg bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">Loading email connections...</p>
        </div>
      ) : connections?.data?.length === 0 ? (
        <div className="rounded-lg bg-muted/50 p-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-foreground">No email accounts connected</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect your email to start importing transactions automatically
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Connect Your First Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections?.data?.map((connection: any) => (
            <div
              key={connection.id}
              className="flex items-center justify-between rounded-lg border bg-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{connection.email}</p>
                    <span className="text-sm capitalize text-muted-foreground">
                      ({connection.provider})
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(connection.status)}
                    <span className={`text-sm font-medium capitalize ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </span>
                    {connection.lastSyncedAt && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Last synced {new Date(connection.lastSyncedAt).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                  {connection.errorMessage && (
                    <p className="mt-1 text-sm text-red-600">{connection.errorMessage}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSync(connection.id)}
                  disabled={connection.status === 'syncing' || syncMutation.isPending}
                  className="flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      connection.status === 'syncing' ? 'animate-spin' : ''
                    }`}
                  />
                  Sync Now
                </button>
                <button
                  onClick={() => handleDisconnect(connection.id)}
                  className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <EmailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />
    </div>
  );
}
