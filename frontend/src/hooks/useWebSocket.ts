import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { API_CONFIG } from '@/config/api.config';

interface UseWebSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    namespace = '/notifications',
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const { user, accessToken } = useAuthStore();

  const connect = useCallback(() => {
    // Don't connect if WebSocket is disabled
    if (!API_CONFIG.websocket.enabled) {
      console.log('WebSocket is disabled via configuration');
      return;
    }

    if (socketRef.current?.connected || !user || !accessToken) {
      return;
    }

    try {
      socketRef.current = io(`${API_CONFIG.baseURL}${namespace}`, {
        auth: {
          token: accessToken,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected:', socketRef.current?.id);
        // Emit authenticate after connection
        socketRef.current?.emit('authenticate', user.id);
        onConnect?.();
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        onError?.(error);
      });
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      onError?.(error);
    }
  }, [user, accessToken, namespace, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit event "${event}" - WebSocket not connected`);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected ?? false,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
