import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@services/api';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface DeviceInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
}

interface Session {
  id: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  lastActive: string;
  createdAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export default function SessionsTab() {
  const queryClient = useQueryClient();
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);

  // Fetch sessions
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await sessionsApi.getAll();
      return response;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Revoke single session mutation
  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsApi.revoke(sessionId),
    onSuccess: () => {
      toast.success('Session revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setRevokeSessionId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke session');
    },
  });

  // Revoke all sessions mutation
  const revokeAllMutation = useMutation({
    mutationFn: () => sessionsApi.revokeAll(),
    onSuccess: (data: any) => {
      toast.success(data.message || 'All other sessions revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowRevokeAllConfirm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to revoke sessions');
    },
  });

  const handleRevokeSession = (sessionId: string) => {
    revokeMutation.mutate(sessionId);
  };

  const handleRevokeAll = () => {
    revokeAllMutation.mutate();
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone className="h-6 w-6" />;
      case 'Tablet':
        return <Tablet className="h-6 w-6" />;
      default:
        return <Monitor className="h-6 w-6" />;
    }
  };

  const getDeviceName = (deviceInfo: DeviceInfo) => {
    return `${deviceInfo.browser} on ${deviceInfo.os}`;
  };

  const otherSessions = Array.isArray(sessions) ? sessions.filter((s) => !s.isCurrent) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor devices that are currently logged in to your account
          </p>
        </div>

        {otherSessions.length > 0 && (
          <button
            onClick={() => setShowRevokeAllConfirm(true)}
            disabled={revokeAllMutation.isPending}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Logout All Other Devices
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Error loading sessions</h4>
              <p className="mt-1 text-sm text-red-700">
                {(error as any).response?.data?.message || 'Failed to load sessions'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {Array.isArray(sessions) && sessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-lg border p-4 ${
                session.isCurrent
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      session.isCurrent ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getDeviceIcon(session.deviceInfo.deviceType)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {getDeviceName(session.deviceInfo)}
                      </h4>
                      {session.isCurrent && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                          Current Session
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>
                          {session.deviceInfo.browser} {session.deviceInfo.browserVersion}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.ipAddress}</span>
                        {session.location && <span> • {session.location}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last active{' '}
                          {formatDistanceToNow(new Date(session.lastActive), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        Signed in {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => setRevokeSessionId(session.id)}
                    disabled={revokeMutation.isPending}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}

          {(!Array.isArray(sessions) || sessions.length === 0) && (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <Monitor className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 font-medium text-gray-900">No active sessions</h3>
              <p className="mt-2 text-sm text-gray-600">
                You don't have any active sessions at the moment
              </p>
            </div>
          )}
        </div>
      )}

      {/* Revoke Session Confirmation Modal */}
      {revokeSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Revoke Session</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to revoke this session? The device will be logged out
              immediately.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRevokeSessionId(null)}
                disabled={revokeMutation.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeSession(revokeSessionId)}
                disabled={revokeMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {revokeMutation.isPending ? 'Revoking...' : 'Revoke Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke All Sessions Confirmation Modal */}
      {showRevokeAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Logout All Other Devices
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This will log you out from all other devices. You will remain logged in on this
              device. Are you sure you want to continue?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRevokeAllConfirm(false)}
                disabled={revokeAllMutation.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeAll}
                disabled={revokeAllMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {revokeAllMutation.isPending ? 'Logging out...' : 'Logout All Devices'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
