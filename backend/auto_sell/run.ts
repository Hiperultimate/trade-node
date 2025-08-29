import redisClient from "../db_connection/redis_pub";
import type { IPubQuotes } from "../types";
import { tradeManager } from "../store";
import { TradeManager } from "./trade_manager";

export const initiateTradeManager = () => {
  redisClient.pSubscribe("*", async (message, channel) => {
    const data: IPubQuotes = JSON.parse(message);
    // filter prices for assets
    const symbol = data.symbol;
    const askPrice = data.askPrice;

    if (!tradeManager[symbol]) {
      tradeManager[symbol] = new TradeManager();
    }

    // push prices for each asset in trade manager
    tradeManager[symbol]!.onPriceUpdate(askPrice);
  });
};
