import client from "./db_connect/timescale_db";
import redisSubClient from "./db_connect/redis_sub_client";
import redisDataClient from "./db_connect/redis_data_client";

import type { IPubQuotes } from "./types";


await redisSubClient.pSubscribe("*", async (item) => {
  console.log("Redis published output : ", item);
  const data: IPubQuotes = JSON.parse(item);
  
  const queryText = `
  INSERT INTO quotes (time, symbol, ask_price, bid_price, real_price)
  VALUES (to_timestamp($1), $2, $3, $4, $5)
  `;

  const value = [data.time / 1000, data.symbol, data.askPrice, data.bidPrice, data.realPrice];
  console.log("Checking parsed data : ", value);
  await client.query(queryText, value);



  // Setting latest price to redis DB
  await redisDataClient.hSet(`asset:${data.symbol}`, {
    ask: data.askPrice.toString(),
    bid: data.bidPrice.toString(),
  });
});
