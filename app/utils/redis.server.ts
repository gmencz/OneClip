import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("REDIS_URL environment variable is missing");
}

const redis = new Redis(
  REDIS_URL,
  process.env.NODE_ENV === "development" ? {} : { family: 6 }
);

export { redis };
