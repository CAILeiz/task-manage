import { createClient, RedisClientType } from 'redis';

// Redis 客户端
let client: RedisClientType | null = null;

const redisConfig = {
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
};

/**
 * 获取 Redis 客户端
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient(redisConfig);
    client.on('error', (err) => console.error('Redis Client Error:', err));
    await client.connect();
    console.log('Redis connected');
  }
  return client;
}

/**
 * 设置值（带可选过期时间，单位秒）
 */
export async function setValue(key: string, value: string, ttl?: number): Promise<void> {
  const redis = await getRedisClient();
  if (ttl) {
    await redis.setEx(key, ttl, value);
  } else {
    await redis.set(key, value);
  }
}

/**
 * 获取值
 */
export async function getValue(key: string): Promise<string | null> {
  const redis = await getRedisClient();
  return await redis.get(key);
}

/**
 * 删除键
 */
export async function deleteKey(key: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(key);
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
    console.log('Redis disconnected');
  }
}

export default {
  getRedisClient,
  setValue,
  getValue,
  deleteKey,
  closeRedis,
};
