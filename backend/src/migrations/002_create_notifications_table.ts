import { Pool } from 'mysql2/promise';

export async function up(pool: Pool): Promise<void> {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      type ENUM('task_reminder', 'task_completed', 'task_uncompleted') NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      task_id VARCHAR(36),
      read_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_read (user_id, read_at),
      INDEX idx_user_created (user_id, created_at),
      INDEX idx_task (task_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('Migration: notifications table created');
}

export async function down(pool: Pool): Promise<void> {
  await pool.execute('DROP TABLE IF EXISTS notifications');
  console.log('Migration: notifications table dropped');
}