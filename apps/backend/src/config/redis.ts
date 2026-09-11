import dotenv from 'dotenv';
dotenv.config();

export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  isRealRedis: Boolean(process.env.REDIS_URL || process.env.REDIS_HOST),
};
