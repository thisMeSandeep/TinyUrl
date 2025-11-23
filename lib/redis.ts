import "dotenv/config";

import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
  redis?: Redis;
};

const redis =
  globalForRedis.redis ??
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

export { redis };
