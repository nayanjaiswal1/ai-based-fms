import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { API_CONFIG } from '@/config/api.config';

export function useGroupWebSocket(groupId: string) {
  const queryClient = useQueryClient();
  const { connected, on, off, emit } = useWebSocket({
    namespace: `/groups/${groupId}`,
    autoConnect: API_CONFIG.websocket.enabled,
  });

  // Create stable handlers using useCallback
  const handleTransactionCreated = useCallback((data: any) => {
    console.log('Transaction created:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    }
  }, [groupId, queryClient]);

  const handleTransactionUpdated = useCallback((data: any) => {
    console.log('Transaction updated:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    }
  }, [groupId, queryClient]);

  const handleTransactionDeleted = useCallback((data: any) => {
    console.log('Transaction deleted:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    }
  }, [groupId, queryClient]);

  const handleMemberJoined = useCallback((data: any) => {
    console.log('Member joined:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    }
  }, [groupId, queryClient]);

  const handleMemberLeft = useCallback((data: any) => {
    console.log('Member left:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    }
  }, [groupId, queryClient]);

  const handleSettlementRecorded = useCallback((data: any) => {
    console.log('Settlement recorded:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
    }
  }, [groupId, queryClient]);

  const handlePresenceUpdate = useCallback((data: any) => {
    console.log('Presence updated:', data);
    if (data.groupId === groupId) {
      queryClient.invalidateQueries({ queryKey: ['group-presence', groupId] });
    }
  }, [groupId, queryClient]);

  useEffect(() => {
    if (!connected || !API_CONFIG.websocket.enabled) return;

    // Register event listeners
    on('transaction:created', handleTransactionCreated);
    on('transaction:updated', handleTransactionUpdated);
    on('transaction:deleted', handleTransactionDeleted);
    on('member:joined', handleMemberJoined);
    on('member:left', handleMemberLeft);
    on('settlement:recorded', handleSettlementRecorded);
    on('presence:update', handlePresenceUpdate);

    // Cleanup function - remove all event listeners
    return () => {
      off('transaction:created', handleTransactionCreated);
      off('transaction:updated', handleTransactionUpdated);
      off('transaction:deleted', handleTransactionDeleted);
      off('member:joined', handleMemberJoined);
      off('member:left', handleMemberLeft);
      off('settlement:recorded', handleSettlementRecorded);
      off('presence:update', handlePresenceUpdate);
    };
  }, [
    connected,
    on,
    off,
    handleTransactionCreated,
    handleTransactionUpdated,
    handleTransactionDeleted,
    handleMemberJoined,
    handleMemberLeft,
    handleSettlementRecorded,
    handlePresenceUpdate,
  ]);

  const emitPresence = (status: 'viewing' | 'editing' | 'offline') => {
    emit('presence:update', { status, timestamp: new Date().toISOString() });
  };

  const notifyTyping = (field: string) => {
    emit('user:typing', { field, timestamp: new Date().toISOString() });
  };

  return {
    connected,
    emitPresence,
    notifyTyping,
  };
}
