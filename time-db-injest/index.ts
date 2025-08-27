import client from "./timescale_db";
import redisClient from "./redis_db";

const res = await client.query("SELECT version()");
console.log("DB Version:", res.rows[0].version);

await redisClient.pSubscribe("*", (item) => {
    console.log("Redis published output : ", item);
});

// const createTable = await client.query(`CREATE TABLE IF NOT EXISTS quotes (
//   time        TIMESTAMPTZ       NOT NULL,
//   symbol      TEXT              NOT NULL,
//   bid_price   DOUBLE PRECISION  NOT NULL,
//   ask_price   DOUBLE PRECISION  NOT NULL
// )`);

// fetch data from redis polling server 
// subscribe to redis 
// log the data
