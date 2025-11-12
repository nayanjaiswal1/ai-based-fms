import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface StatementTransaction {
  amount: number;
  date: string;
  description: string;
  referenceNumber?: string;
}

export interface StartReconciliationDto {
  accountId: string;
  startDate: string;
  endDate: string;
  statementBalance: number;
  notes?: string;
}

export interface UploadStatementDto {
  transactions: StatementTransaction[];
}

export interface MatchTransactionDto {
  reconciliationTransactionId: string;
  transactionId: string;
  isManual?: boolean;
  notes?: string;
}

export interface UnmatchTransactionDto {
  reconciliationTransactionId: string;
}

export interface AdjustmentDto {
  type: string;
  amount: number;
  reason: string;
}

export interface CompleteReconciliationDto {
  notes?: string;
  adjustments?: AdjustmentDto[];
}

export interface AdjustBalanceDto {
  amount: number;
  reason: string;
}

export const reconciliationApi = {
  startReconciliation: async (data: StartReconciliationDto) => {
    const response = await axios.post(`${API_URL}/reconciliations/start`, data);
    return response.data;
  },

  uploadStatement: async (reconciliationId: string, data: UploadStatementDto) => {
    const response = await axios.post(
      `${API_URL}/reconciliations/${reconciliationId}/upload-statement`,
      data
    );
    return response.data;
  },

  getReconciliation: async (reconciliationId: string) => {
    const response = await axios.get(`${API_URL}/reconciliations/${reconciliationId}`);
    return response.data;
  },

  matchTransaction: async (reconciliationId: string, data: MatchTransactionDto) => {
    const response = await axios.post(
      `${API_URL}/reconciliations/${reconciliationId}/match`,
      data
    );
    return response.data;
  },

  unmatchTransaction: async (reconciliationId: string, data: UnmatchTransactionDto) => {
    const response = await axios.post(
      `${API_URL}/reconciliations/${reconciliationId}/unmatch`,
      data
    );
    return response.data;
  },

  completeReconciliation: async (reconciliationId: string, data: CompleteReconciliationDto) => {
    const response = await axios.post(
      `${API_URL}/reconciliations/${reconciliationId}/complete`,
      data
    );
    return response.data;
  },

  cancelReconciliation: async (reconciliationId: string) => {
    const response = await axios.delete(`${API_URL}/reconciliations/${reconciliationId}/cancel`);
    return response.data;
  },

  getReconciliationHistory: async (accountId: string) => {
    const response = await axios.get(`${API_URL}/reconciliations/history/${accountId}`);
    return response.data;
  },

  adjustBalance: async (reconciliationId: string, data: AdjustBalanceDto) => {
    const response = await axios.post(
      `${API_URL}/reconciliations/${reconciliationId}/adjust-balance`,
      data
    );
    return response.data;
  },
};
