import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { auditApi } from '@services/api';
import { FieldDiff } from './FieldDiff';
import { Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  changes: Record<string, { before: any; after: any }>;
  description?: string;
  createdAt: string;
}

interface AuditTrailProps {
  entityType: string;
  entityId: string;
  showExport?: boolean;
  maxHeight?: string;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({
  entityType,
  entityId,
  showExport = false,
  maxHeight = '600px',
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, [entityType, entityId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditApi.getEntityLogs(entityType, entityId);
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const exportAuditTrail = () => {
    const csv = generateCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${entityType}-${entityId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (logs: AuditLog[]) => {
    const headers = ['Date', 'Action', 'Description', 'Changes'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.action,
      log.description || '',
      Object.keys(log.changes || {})
        .map((key) => `${key}: ${log.changes[key].before} → ${log.changes[key].after}`)
        .join('; '),
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 font-bold text-lg">+</span>
          </div>
        );
      case 'update':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">✎</span>
          </div>
        );
      case 'delete':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">×</span>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 font-bold text-lg">•</span>
          </div>
        );
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No audit history available for this item.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showExport && (
        <div className="flex justify-end">
          <button
            onClick={exportAuditTrail}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Audit Trail
          </button>
        </div>
      )}

      <div className="relative" style={{ maxHeight, overflowY: 'auto' }}>
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {logs.map((log, index) => (
            <div key={log.id} className="relative pl-16">
              {/* Timeline dot */}
              <div className="absolute left-0">{getActionIcon(log.action)}</div>

              {/* Log content */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`font-semibold ${getActionColor(log.action)} capitalize`}>
                      {log.action}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {log.changes && Object.keys(log.changes).length > 0 && (
                    <button
                      onClick={() => toggleExpanded(log.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {expandedLogs.has(log.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {log.description && (
                  <p className="text-gray-700 text-sm mb-3">{log.description}</p>
                )}

                {log.action === 'create' && log.newValues && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                    <p className="text-green-800 font-medium mb-2">Initial values:</p>
                    <div className="space-y-1">
                      {Object.entries(log.newValues).map(([key, value]) => {
                        if (key === 'id' || value === null || value === undefined) return null;
                        return (
                          <div key={key} className="flex gap-2">
                            <span className="text-gray-600 font-medium">{key}:</span>
                            <span className="text-green-800">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {log.changes && Object.keys(log.changes).length > 0 && expandedLogs.has(log.id) && (
                  <div className="mt-3 bg-gray-50 rounded p-3">
                    <p className="text-gray-700 font-medium text-sm mb-2">Changes:</p>
                    <div className="space-y-1">
                      {Object.entries(log.changes).map(([key, change]) => (
                        <FieldDiff
                          key={key}
                          fieldName={key}
                          before={change.before}
                          after={change.after}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {log.changes && Object.keys(log.changes).length > 0 && !expandedLogs.has(log.id) && (
                  <div className="mt-2 text-sm text-gray-500">
                    {Object.keys(log.changes).length} field
                    {Object.keys(log.changes).length > 1 ? 's' : ''} changed
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
