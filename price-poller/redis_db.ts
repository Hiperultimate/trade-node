import { createClient } from "redis";

if(!process.env.REDIS_URL) throw new Error("Cannot find Redis DB");

const client = await createClient({ url : 'redis://localhost:6479'})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export default client;