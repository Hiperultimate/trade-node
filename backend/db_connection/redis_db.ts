import { RedisClient } from "bun";

if(!process.env.REDIS_URL) throw new Error("Cannot find Redis DB");

const redisClient = new RedisClient(process.env.REDIS_URL);
redisClient.onclose = function (this: RedisClient, error: Error) {
  console.error("Redis connection closed:", error);
};

await redisClient.connect();

export default redisClient;