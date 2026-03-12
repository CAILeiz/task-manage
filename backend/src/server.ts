import app from './app';
import { createServer } from 'http';
import { initDatabase, closePool } from './config/database';
import { initSocketIO } from './socket/index';
import { startTaskReminderScheduler } from './schedulers/index';

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    await initDatabase();
    console.log('Database initialized');

    const httpServer = createServer(app);

    initSocketIO(httpServer);
    console.log('WebSocket server initialized');

    startTaskReminderScheduler();
    console.log('Task reminder scheduler started');

    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closePool();
  process.exit(0);
});

startServer();
