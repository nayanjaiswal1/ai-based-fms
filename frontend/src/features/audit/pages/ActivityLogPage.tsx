import React, { useState, useEffect } from 'react';
import { auditApi } from '@services/api';
import { FieldDiff } from '@components/audit/FieldDiff';
import {
  Activity,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  FileText,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { VirtualList } from '@/components/virtual';

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

interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const ActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Expanded logs
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, selectedEntityType, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        page,
        limit: 50,
      };

      if (searchQuery) filters.search = searchQuery;
      if (selectedAction) filters.action = selectedAction;
      if (selectedEntityType) filters.entityType = selectedEntityType;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response: AuditLogResponse = await auditApi.getAll(filters);
      setLogs(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAction('');
    setSelectedEntityType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Action', 'Entity Type', 'Description', 'Changes'];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toISOString(),
      log.action,
      log.entityType,
      log.description || '',
      Object.keys(log.changes || {})
        .map((key) => `${key}: ${log.changes[key].before} → ${log.changes[key].after}`)
        .join('; '),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'Transaction':
        return <CreditCard className="w-5 h-5" />;
      case 'Account':
        return <Wallet className="w-5 h-5" />;
      case 'Budget':
        return <PiggyBank className="w-5 h-5" />;
      case 'Investment':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Use virtual scrolling for large datasets (>50 items)
  const useVirtualScrolling = logs.length > 50;

  // Render log item
  const renderLogItem = (log: AuditLog, index: number) => (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Entity Icon */}
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          {getEntityIcon(log.entityType)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
              {log.action}
            </span>
            <span className="text-sm text-gray-600">{log.entityType}</span>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </span>
          </div>

          {log.description && (
            <p className="text-gray-900 mb-2">{log.description}</p>
          )}

          {log.changes && Object.keys(log.changes).length > 0 && (
            <>
              {!expandedLogs.has(log.id) ? (
                <button
                  onClick={() => toggleExpanded(log.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View {Object.keys(log.changes).length} change{Object.keys(log.changes).length > 1 ? 's' : ''}
                  <ChevronDown className="w-4 h-4" />
                </button>
              ) : (
                <div className="mt-3">
                  <button
                    onClick={() => toggleExpanded(log.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-3"
                  >
                    Hide changes
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
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
            </>
          )}

          <p className="text-xs text-gray-400 mt-2">
            {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-gray-600">View all your account activity and changes</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by description or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                type="button"
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={logs.length === 0}
              >
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={selectedAction}
                    onChange={(e) => {
                      setSelectedAction(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="export">Export</option>
                    <option value="import">Import</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entity Type
                  </label>
                  <select
                    value={selectedEntityType}
                    onChange={(e) => {
                      setSelectedEntityType(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="Transaction">Transaction</option>
                    <option value="Account">Account</option>
                    <option value="Budget">Budget</option>
                    <option value="Category">Category</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-4">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {logs.length} of {total} activities
          </div>
        )}

        {/* Activity List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No activity found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : useVirtualScrolling ? (
          <VirtualList
            items={logs}
            renderItem={renderLogItem}
            keyExtractor={(log) => log.id}
            itemHeight={120}
            height="calc(100vh - 450px)"
            overscan={5}
            ariaLabel="Activity log entries"
          />
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id}>
                {renderLogItem(log, logs.indexOf(log))}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
