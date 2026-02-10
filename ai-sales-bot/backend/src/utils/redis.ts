import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export default redis;

export async function connectRedis() {
  try {
    await redis.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
}

export async function disconnectRedis() {
  await redis.quit();
  console.log('Redis disconnected');
}
