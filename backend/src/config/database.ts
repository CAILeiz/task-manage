import mysql from 'mysql2/promise';

// 数据库连接池
let pool: mysql.Pool | null = null;

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'taskmanage',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

/**
 * 获取数据库连接池
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * 获取数据库连接
 */
export async function getDb(): Promise<mysql.PoolConnection> {
  return getPool().getConnection();
}

/**
 * 执行查询（SELECT）
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

/**
 * 执行单行查询
 */
export async function get<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
  const [rows] = await getPool().execute(sql, params);
  const results = rows as T[];
  return results.length > 0 ? results[0] : undefined;
}

/**
 * 执行更新操作（INSERT, UPDATE, DELETE）
 */
export async function run(sql: string, params?: any[]): Promise<{ lastID: number; changes: number }> {
  const [result] = await getPool().execute(sql, params);
  const insertResult = result as mysql.ResultSetHeader;
  return {
    lastID: insertResult.insertId,
    changes: insertResult.affectedRows,
  };
}

/**
 * 初始化数据库 - 创建表
 */
export async function initDatabase(): Promise<void> {
  const pool = getPool();

  // 创建 users 表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // 创建 tasks 表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      name VARCHAR(200) NOT NULL,
      description VARCHAR(100) DEFAULT NULL,
      priority ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
      due_date DATE DEFAULT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_priority (priority),
      INDEX idx_completed (completed),
      INDEX idx_due_date (due_date),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('Database initialized successfully');
}

/**
 * 关闭数据库连接池
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

/**
 * 清空数据库（仅用于测试）
 */
export async function clearDatabase(): Promise<void> {
  const pool = getPool();
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
  await pool.execute('TRUNCATE TABLE tasks');
  await pool.execute('TRUNCATE TABLE users');
  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('Database cleared');
}

export default {
  getPool,
  getDb,
  query,
  get,
  run,
  initDatabase,
  closePool,
  clearDatabase,
};
