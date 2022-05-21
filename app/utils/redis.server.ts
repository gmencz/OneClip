import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD
});

export { redis };
