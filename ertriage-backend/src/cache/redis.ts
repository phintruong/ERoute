import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (err) => console.warn('Redis error:', err.message));

let connected = false;

export async function connectRedis() {
  if (!connected) {
    await redis.connect();
    connected = true;
  }
}

export async function checkRedis() {
  try {
    await connectRedis();
    const pong = await redis.ping();
    console.log(`Redis health check: ${pong}`);
  } catch (err) {
    console.warn('Redis is unavailable — falling back to direct API calls');
  }
}

export async function getWaitTime(city: string): Promise<string | null> {
  try {
    await connectRedis();
    return await redis.get(`waittime:${city.toLowerCase()}`);
  } catch {
    return null;
  }
}

export async function setWaitTime(city: string, value: string) {
  try {
    await connectRedis();
    await redis.set(`waittime:${city.toLowerCase()}`, value, { EX: 1800 });
  } catch {
    console.warn('Failed to cache wait time');
  }
}

export default redis;
