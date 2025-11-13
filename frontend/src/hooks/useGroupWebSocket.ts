import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';

export function useGroupWebSocket(groupId: string) {
  const queryClient = useQueryClient();
  const { connected, on, emit } = useWebSocket({
    namespace: `/groups/${groupId}`,
    autoConnect: true,
  });

  useEffect(() => {
    if (!connected) return;

    // Listen for transaction events
    on('transaction:created', (data) => {
      console.log('Transaction created:', data);
      // Invalidate group queries
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    on('transaction:updated', (data) => {
      console.log('Transaction updated:', data);
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    on('transaction:deleted', (data) => {
      console.log('Transaction deleted:', data);
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    // Listen for member events
    on('member:joined', (data) => {
      console.log('Member joined:', data);
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    on('member:left', (data) => {
      console.log('Member left:', data);
      queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
    });

    // Listen for settlement events
    on('settlement:recorded', (data) => {
      console.log('Settlement recorded:', data);
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-transactions', groupId] });
    });

    // Listen for presence events
    on('presence:update', (data) => {
      console.log('Presence updated:', data);
      queryClient.invalidateQueries({ queryKey: ['group-presence', groupId] });
    });
  }, [connected, on, groupId, queryClient]);

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
