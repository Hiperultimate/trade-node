import redisClient from "../db_connection/redis_pub";
import type { IPubQuotes } from "../types";
import { liquidateLowValuePositions } from "./trade_manager";

export const initiateTradeManager = () => {
  redisClient.pSubscribe("*", async (message, channel) => {
    const data: IPubQuotes = JSON.parse(message);
    // filter prices for assets
    // const symbol = data.symbol;
    // const askPrice = data.askPrice;

    // Probably a bad idea for higher loads. This means slower updates in case of bigger calculations. Should offload this
    await liquidateLowValuePositions(data);
  });
};
