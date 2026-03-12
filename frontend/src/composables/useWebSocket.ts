import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

let socket: Socket | null = null;
const pendingListeners: Array<{ event: string; callback: (data: any) => void }> = [];

export function useWebSocket() {
  const status = ref<ConnectionStatus>('disconnected');
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;

  function connect() {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (!token) {
      console.warn('[WebSocket] No token available');
      return;
    }

    if (socket?.connected) {
      return;
    }

    status.value = 'connecting';

    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:3000';

    socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    socket.on('connect', () => {
      status.value = 'connected';
      reconnectAttempts.value = 0;
      console.log('[WebSocket] Connected');

      // 注册所有 pending 的监听器
      pendingListeners.forEach(({ event, callback }) => {
        socket?.on(event, callback);
      });
    });

    socket.on('disconnect', (reason) => {
      status.value = 'disconnected';
      console.log('[WebSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      reconnectAttempts.value++;
      console.error('[WebSocket] Connection error:', error.message);
    });

    socket.on('pong', () => {
      // Heartbeat response
    });
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      status.value = 'disconnected';
    }
  }

  function on(event: string, callback: (data: any) => void) {
    if (socket?.connected) {
      socket.on(event, callback);
    } else {
      // 保存监听器，等待连接后注册
      pendingListeners.push({ event, callback });
    }
  }

  function off(event: string, callback?: (data: any) => void) {
    socket?.off(event, callback);
  }

  function emit(event: string, data: any) {
    socket?.emit(event, data);
  }

  function ping() {
    socket?.emit('ping');
  }

  return {
    status,
    reconnectAttempts,
    connect,
    disconnect,
    on,
    off,
    emit,
    ping,
  };
}

export function useWebSocketConnection() {
  const { connect, disconnect, status } = useWebSocket();

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return { status };
}

export function getSocket(): Socket | null {
  return socket;
}