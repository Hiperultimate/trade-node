import { Client } from "pg";

const client = new Client({
    connectionString: process.env.TIMESCALE_DB
})

await client.connect();

export default client;