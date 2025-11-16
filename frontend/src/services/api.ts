import axios from 'axios';
import { useAuthStore } from '@stores/authStore';
import { API_CONFIG } from '@config/api.config';

export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if a refresh is in progress to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor - cookies are sent automatically
api.interceptors.request.use(
  (config) => {
    // Ensure credentials are included for cookie-based auth
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if:
    // 1. Already retried (_retry flag is set)
    // 2. Request is to the refresh endpoint itself (prevent infinite loop)
    // 3. Request is to login/register endpoints
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 &&
        !originalRequest._retry &&
        !isRefreshEndpoint &&
        !isAuthEndpoint) {

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest.withCredentials = true;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token using cookie-based refresh endpoint
        await axios.post(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refresh}`,
          {},
          { withCredentials: true }
        );

        // Refresh succeeded, process queued requests
        processQueue();
        isRefreshing = false;

        // Retry the original request with new cookie
        originalRequest.withCredentials = true;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear queue and logout
        processQueue(refreshError);
        isRefreshing = false;

        // Only redirect once to prevent multiple redirects
        const authStore = useAuthStore.getState();
        if (authStore.isAuthenticated) {
          authStore.logout();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // If it's a 401 on the refresh endpoint itself, just logout
    if (error.response?.status === 401 && isRefreshEndpoint) {
      const authStore = useAuthStore.getState();
      if (authStore.isAuthenticated) {
        authStore.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

// API functions
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  login2FA: (data: any) => api.post('/auth/login/2fa', data),
  googleOAuth: (code: string) => api.post('/auth/oauth/google', { code }),
  getCurrentUser: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh', {}),
  logout: () => api.post('/auth/logout', {}),
  enable2FA: () => api.post('/auth/2fa/enable'),
  verify2FASetup: (code: string) => api.post('/auth/2fa/verify-setup', { code }),
  disable2FA: (code: string) => api.post('/auth/2fa/disable', { code }),
  requestPasswordReset: (email: string) => api.post('/auth/password/reset-request', { email }),
  resetPassword: (token: string, newPassword: string) => api.post('/auth/password/reset', { token, newPassword }),
};

export const sessionsApi = {
  getAll: () => api.get('/sessions'),
  revoke: (sessionId: string) => api.delete(`/sessions/${sessionId}`),
  revokeAll: () => api.delete('/sessions'),
};

export const accountsApi = {
  getAll: () => api.get('/accounts'),
  getOne: (id: string) => api.get(`/accounts/${id}`),
  create: (data: any) => api.post('/accounts', data),
  update: (id: string, data: any) => api.patch(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
};

export const reconciliationApi = {
  startReconciliation: (data: any) => api.post('/reconciliations/start', data),
  getReconciliation: (id: string) => api.get(`/reconciliations/${id}`),
  getHistory: (accountId: string) => api.get(`/reconciliations/history/${accountId}`),
  uploadStatement: (id: string, data: any) => api.post(`/reconciliations/${id}/upload-statement`, data),
  matchTransaction: (id: string, data: any) => api.post(`/reconciliations/${id}/match`, data),
  unmatchTransaction: (id: string, data: any) => api.post(`/reconciliations/${id}/unmatch`, data),
  completeReconciliation: (id: string, data: any) => api.post(`/reconciliations/${id}/complete`, data),
  cancelReconciliation: (id: string) => api.delete(`/reconciliations/${id}/cancel`),
  adjustBalance: (id: string, data: any) => api.post(`/reconciliations/${id}/adjust-balance`, data),
};

export const transactionsApi = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  getOne: (id: string) => api.get(`/transactions/${id}`),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getSource: (id: string) => api.get(`/transactions/${id}/source`),
  create: (data: any) => api.post('/transactions', data),
  update: (id: string, data: any) => api.patch(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  getStats: (startDate: string, endDate: string) =>
    api.get('/transactions/stats', { params: { startDate, endDate } }),
  bulkCreate: (data: any) => api.post('/transactions/bulk', data),
  bulkDelete: (ids: string[]) => api.post('/transactions/bulk-delete', { ids }),
  mergeTransactions: (primaryId: string, duplicateIds: string[]) =>
    api.post(`/transactions/${primaryId}/merge`, { duplicateIds }),
  unmergeTransaction: (id: string) => api.post(`/transactions/${id}/unmerge`),
  markNotDuplicate: (id: string, comparedWithId: string) =>
    api.post(`/transactions/${id}/mark-not-duplicate`, { comparedWithId }),
  getMergedTransactions: (id: string) => api.get(`/transactions/${id}/merged`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getTree: () => api.get('/categories/tree'),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  reorder: (data: any) => api.patch('/categories/reorder', data),
};

export const tagsApi = {
  getAll: () => api.get('/tags'),
  getOne: (id: string) => api.get(`/tags/${id}`),
  create: (data: any) => api.post('/tags', data),
  update: (id: string, data: any) => api.patch(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

export const budgetsApi = {
  getAll: (params?: any) => api.get('/budgets', { params }),
  getOne: (id: string) => api.get(`/budgets/${id}`),
  create: (data: any) => api.post('/budgets', data),
  update: (id: string, data: any) => api.patch(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  getProgress: (id: string) => api.get(`/budgets/${id}/progress`),
  checkAlerts: () => api.get('/budgets/alerts'),
};

export const groupsApi = {
  getAll: () => api.get('/groups'),
  getOne: (id: string) => api.get(`/groups/${id}`),
  getUnifiedBalances: () => api.get('/groups/unified-balances'),
  create: (data: any) => api.post('/groups', data),
  update: (id: string, data: any) => api.patch(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
  addMember: (id: string, data: any) => api.post(`/groups/${id}/members`, data),
  removeMember: (id: string, memberId: string) => api.delete(`/groups/${id}/members/${memberId}`),
  updateMemberRole: (id: string, memberId: string, data: any) =>
    api.patch(`/groups/${id}/members/${memberId}`, data),
  getExpenses: (id: string) => api.get(`/groups/${id}/transactions`),
  createExpense: (id: string, data: any) => api.post(`/groups/${id}/transactions`, data),
  getBalances: (id: string) => api.get(`/groups/${id}/balances`),
  getSettlements: (id: string) => api.get(`/groups/${id}/settlements`),
  settleUp: (id: string, data: any) => api.post(`/groups/${id}/settle`, data),
};

export const investmentsApi = {
  getAll: () => api.get('/investments'),
  getOne: (id: string) => api.get(`/investments/${id}`),
  create: (data: any) => api.post('/investments', data),
  update: (id: string, data: any) => api.patch(`/investments/${id}`, data),
  delete: (id: string) => api.delete(`/investments/${id}`),
  getPortfolio: () => api.get('/investments/portfolio'),
  getPerformance: (id: string) => api.get(`/investments/${id}/performance`),
};

export const lendBorrowApi = {
  getAll: (params?: any) => api.get('/lend-borrow', { params }),
  getOne: (id: string) => api.get(`/lend-borrow/${id}`),
  create: (data: any) => api.post('/lend-borrow', data),
  update: (id: string, data: any) => api.patch(`/lend-borrow/${id}`, data),
  delete: (id: string) => api.delete(`/lend-borrow/${id}`),
  convertToGroup: (id: string) => api.post(`/lend-borrow/${id}/convert-to-group`),
  recordPayment: (id: string, data: any) => api.post(`/lend-borrow/${id}/payments`, data),
  getPayments: (id: string) => api.get(`/lend-borrow/${id}/payments`),
  getSummary: () => api.get('/lend-borrow/summary'),
};

export const sharedExpensesApi = {
  getAll: (params?: any) => api.get('/shared-expenses', { params }),
  getOne: (id: string) => api.get(`/shared-expenses/${id}`),
  createPersonalDebt: (data: any) => api.post('/shared-expenses/personal-debt', data),
  createGroup: (data: any) => api.post('/shared-expenses/group', data),
  update: (id: string, data: any) => api.put(`/shared-expenses/${id}`, data),
  delete: (id: string) => api.delete(`/shared-expenses/${id}`),
  addTransaction: (id: string, data: any) => api.post(`/shared-expenses/${id}/transactions`, data),
  getConsolidatedDebts: () => api.get('/shared-expenses/consolidated-debts'),
  checkDuplicate: (identifier: string) => api.get(`/shared-expenses/check-duplicate`, { params: { identifier } }),
};

export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: any) => api.patch('/notifications/preferences', data),
};

export const remindersApi = {
  getAll: (params?: any) => api.get('/reminders', { params }),
  getOne: (id: string) => api.get(`/reminders/${id}`),
  create: (data: any) => api.post('/reminders', data),
  update: (id: string, data: any) => api.patch(`/reminders/${id}`, data),
  delete: (id: string) => api.delete(`/reminders/${id}`),
  snooze: (id: string, data: any) => api.post(`/reminders/${id}/snooze`, data),
  dismiss: (id: string) => api.post(`/reminders/${id}/dismiss`),
};

export const analyticsApi = {
  getOverview: (params: any) => api.get('/analytics/overview', { params }),
  getCategoryBreakdown: (params: any) => api.get('/analytics/category-breakdown', { params }),
  getTrends: (params: any) => api.get('/analytics/trends', { params }),
  getComparison: (params: any) => api.get('/analytics/comparison', { params }),
  getAccountHistory: (accountId: string, params: any) =>
    api.get(`/analytics/account-history/${accountId}`, { params }),
  getNetWorth: () => api.get('/analytics/net-worth'),
};

export const aiApi = {
  categorize: (data: any) => api.post('/ai/categorize', data),
  categorizeTransactions: (transactionIds: string[]) =>
    api.post('/ai/categorize-transactions', { transactionIds }),
  parseReceipt: (data: FormData) => api.post('/ai/parse-receipt', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getInsights: (params: any) => api.get('/ai/insights', { params }),
  detectDuplicates: (params?: { threshold?: number; timeWindow?: number; includeCategories?: boolean }) =>
    api.get('/ai/detect-duplicates', { params }),
  generateBudget: (data: {
    monthlyIncome: number;
    savingsGoal?: number;
    debtPayments?: number;
    regularExpenses?: string[];
    additionalContext?: string;
  }) => api.post('/ai/generate-budget', data),
};

export const importApi = {
  createLog: (data: { type: string; fileName: string; description?: string }) =>
    api.post('/import/create', data),
  parse: (data: { fileContent: string; fileType: string; mappingConfig?: Record<string, any> }) =>
    api.post('/import/parse', data),
  confirm: (data: { importId: string; transactions: any[]; defaultAccountId?: string; autoCategorize?: boolean }) =>
    api.post('/import/confirm', data),
  getHistory: () => api.get('/import/history'),
};

export const emailApi = {
  getConnections: () => api.get('/email/connections'),
  getGmailAuthUrl: () => api.get('/email/gmail/auth-url'),
  handleGmailCallback: (code: string) => api.post('/email/gmail/callback', { code }),
  connect: (data: any) => api.post('/email/connect', data),
  disconnect: (id: string) => api.delete(`/email/connections/${id}`),
  sync: (connectionId: string) => api.post('/email/sync', { connectionId }),
  getPreferences: () => api.get('/email/preferences'),
  updatePreferences: (data: any) => api.patch('/email/preferences', data),
};

export const chatApi = {
  sendMessage: (data: any) => api.post('/chat/message', data),
  getHistory: (conversationId: string) => api.get(`/chat/history/${conversationId}`),
  clearHistory: (conversationId: string) => api.delete(`/chat/history/${conversationId}`),
  executeCommand: (data: any) => api.post('/chat/command', data),
  getSuggestions: () => api.get('/chat/suggestions'),
};

export const adminApi = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  suspendUser: (id: string) => api.post(`/admin/users/${id}/suspend`),
  getSystemStats: (days?: number) => api.get('/admin/stats', { params: { days } }),
  getActivityLogs: (params?: any) => api.get('/admin/activity-logs', { params }),
  getPerformanceMetrics: () => api.get('/admin/performance'),
};

export const gdprApi = {
  exportData: () => api.get('/gdpr/export'),
  deleteAccount: (password: string, reason?: string) =>
    api.delete('/gdpr/delete-account', { data: { password, reason } }),
};

export const exportApi = {
  // Email-based export (new centralized method)
  requestEmailExport: (data: {
    entities: string[];
    format: string;
    includeFilters?: boolean;
  }) => api.post('/export/email', data),

  // Transaction exports (legacy - kept for backward compatibility)
  exportTransactionsCSV: (filters: any) =>
    api.post('/export/transactions/csv', filters, { responseType: 'blob' }),
  exportTransactionsExcel: (filters: any) =>
    api.post('/export/transactions/excel', filters, { responseType: 'blob' }),
  exportTransactionsPDF: (filters: any) =>
    api.post('/export/transactions/pdf', filters, { responseType: 'blob' }),

  // Budget exports (legacy)
  exportBudgetsCSV: (filters: any) =>
    api.post('/export/budgets/csv', filters, { responseType: 'blob' }),
  exportBudgetsExcel: (filters: any) =>
    api.post('/export/budgets/excel', filters, { responseType: 'blob' }),
  exportBudgetsPDF: (filters: any) =>
    api.post('/export/budgets/pdf', filters, { responseType: 'blob' }),

  // Analytics exports
  exportAnalyticsCSV: (filters: any) =>
    api.post('/export/analytics/csv', filters, { responseType: 'blob' }),
  exportAnalyticsPDF: (filters: any) =>
    api.post('/export/analytics/pdf', filters, { responseType: 'blob' }),

  // Account exports
  exportAccountsCSV: () =>
    api.post('/export/accounts/csv', {}, { responseType: 'blob' }),
  exportAccountsPDF: () =>
    api.post('/export/accounts/pdf', {}, { responseType: 'blob' }),
};

export const auditApi = {
  getAll: (filters?: any) => api.get('/audit', { params: filters }),
  getEntityLogs: (entity: string, entityId: string) =>
    api.get(`/audit/entity/${entity}/${entityId}`),
  getTransactionHistory: (transactionId: string) =>
    api.get(`/audit/transaction/${transactionId}/history`),
  getUserActivity: (dateRange?: { startDate?: string; endDate?: string }) =>
    api.get('/audit/activity', { params: dateRange }),
};

export const insightsApi = {
  getAll: (options?: any) => api.get('/insights', { params: options }),
  getSpending: (options?: any) => api.get('/insights/spending', { params: options }),
  getBudget: () => api.get('/insights/budget'),
  getSavings: (options?: any) => api.get('/insights/savings', { params: options }),
  getAnomalies: (options?: any) => api.get('/insights/anomalies', { params: options }),
  getTrends: () => api.get('/insights/trends'),
  getHealth: () => api.get('/insights/health'),
  getPredictions: () => api.get('/insights/predictions'),
  generate: (options?: any) => api.post('/insights/generate', options),
};

export const reportsApi = {
  // Report CRUD operations
  getReports: (query?: any) => api.get('/reports', { params: query }),
  getReport: (id: string) => api.get(`/reports/${id}`),
  createReport: (data: any) => api.post('/reports', data),
  updateReport: (id: string, data: any) => api.put(`/reports/${id}`, data),
  deleteReport: (id: string) => api.delete(`/reports/${id}`),
  duplicateReport: (id: string) => api.post(`/reports/${id}/duplicate`),
  toggleFavorite: (id: string) => api.post(`/reports/${id}/favorite`),

  // Report generation
  generateReport: (id: string, data: any) => api.post(`/reports/${id}/generate`, data),
  previewReport: (id: string) => api.get(`/reports/${id}/preview`),

  // Generated reports
  getGeneratedReports: (reportId: string) => api.get(`/reports/${reportId}/generated`),
  getGeneratedReport: (id: string) => api.get(`/reports/generated/${id}`),
  downloadGeneratedReport: (id: string) => api.get(`/reports/generated/${id}/download`, { responseType: 'blob' }),
  deleteGeneratedReport: (id: string) => api.delete(`/reports/generated/${id}`),

  // Templates
  getTemplates: () => api.get('/reports/templates'),
  getTemplate: (type: string) => api.get(`/reports/templates/${type}`),
  createFromTemplate: (type: string, name?: string) => api.post(`/reports/templates/${type}`, { name }),
};

export default api;
