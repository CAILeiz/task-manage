import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let io: Server;

export interface WebSocketMessage {
  type: 'notification' | 'task_update' | 'counts_update';
  payload: any;
  timestamp: number;
}

/**
 * 初始化 Socket.IO 服务
 */
export function initSocketIO(httpServer: any): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Redis adapter for horizontal scaling
  setupRedisAdapter().catch((err) => {
    console.warn('Redis adapter setup failed, running without adapter:', err.message);
  });

  // JWT 认证中间件
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  // 连接处理
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    // 加入用户专属房间
    socket.join(`user:${userId}`);
    console.log(`[WebSocket] User ${userId} connected, socket: ${socket.id}`);

    // 心跳
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] User ${userId} disconnected: ${reason}`);
    });
  });

  console.log('[WebSocket] Server initialized');
  return io;
}

/**
 * 设置 Redis Adapter
 */
async function setupRedisAdapter(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));
  console.log('[WebSocket] Redis adapter connected');
}

/**
 * 向指定用户发送消息
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) {
    console.warn('[WebSocket] IO not initialized');
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * 广播任务统计更新
 */
export function broadcastCountsUpdate(userId: string, counts: any): void {
  const message: WebSocketMessage = {
    type: 'counts_update',
    payload: counts,
    timestamp: Date.now(),
  };
  emitToUser(userId, 'message', message);
}

/**
 * 发送通知给用户
 */
export function sendNotification(userId: string, notification: any): void {
  const message: WebSocketMessage = {
    type: 'notification',
    payload: notification,
    timestamp: Date.now(),
  };
  emitToUser(userId, 'message', message);
}

/**
 * 获取 IO 实例
 */
export function getIO(): Server | undefined {
  return io;
}