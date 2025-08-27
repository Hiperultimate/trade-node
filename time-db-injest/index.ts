import client from "./timescale_db";
import redisClient from "./redis_db";
import type { IPubQuotes } from "./types";


await redisClient.pSubscribe("*", async (item) => {
  console.log("Redis published output : ", item);
  const data: IPubQuotes = JSON.parse(item);

  const queryText = `
    INSERT INTO quotes (time, symbol, bid_price, ask_price)
    VALUES (NOW(), $1, $2, $3)
    `;
  const value = [...Object.values(data)];
  await client.query(queryText, value);
});
