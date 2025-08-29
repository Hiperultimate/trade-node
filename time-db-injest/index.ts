import client from "./db_connect/timescale_db";
import redisSubClient from "./db_connect/redis_sub_client";
import redisDataClient from "./db_connect/redis_data_client";

import type { IPubQuotes } from "./types";


await redisSubClient.pSubscribe("*", async (item) => {
  console.log("Redis published output : ", item);
  const data: IPubQuotes = JSON.parse(item);

  const queryText = `
    INSERT INTO quotes (time, symbol, bid_price, ask_price)
    VALUES (NOW(), $1, $2, $3)
    `;
  const value = [...Object.values(data)];
  await client.query(queryText, value);

  console.log("Checking parsed data : ", data);

  // Setting latest price to redis DB
  await redisDataClient.hSet(`asset:${data.symbol}`, {
    ask: data.askPrice.toString(),
    bid: data.bidPrice.toString(),
  });
});
