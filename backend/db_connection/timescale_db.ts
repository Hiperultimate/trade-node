import { SQL } from "bun";

if (!process.env.TIMESCALE_DB) throw new Error("Cannot find timescale DB");

const client = new SQL(process.env.TIMESCALE_DB);

await client.connect();

export default client;
