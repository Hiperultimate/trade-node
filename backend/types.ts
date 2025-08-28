type CoinBalance = {
    qty: number;
};

// Currently only in USD
type UserBalanceMap = {
  [coinName: string]: CoinBalance;
};

export type Users = {
  [userId: string]: {
    password: string,
    balance: UserBalanceMap,
    user_orders: string[] // Will store order_id of IUserOrders    
  };
};

export type IFetchAssetDetails = {
    time: Date,
    symbol: string,
    bid_price: number,
    ask_price: number
}[]

export type IUserOrders = {
  [order_id: string]: IOrders;
};

type IOrders = {
    username: string,
    qty: number, // 0.002
    margin: number, // 100 (money spent in $)
    leverage: number, // (1-100x multipler)
    asset_bought_price: number, // 110000
    asset: string, // "BTC" | "ETH" etc
    type: "buy" | "sell"
}

export type ICandleDuration = "1m" | "5m" | "15m" | "30m";

export enum CandleDuration {
  OneMinute = "1m",
  FiveMinutes = "5m",
  FifteenMinutes = "15m",
  ThirtyMinutes = "30m",
}

export type CandleTable = "candlestick_1m" | "candlestick_5m" | "candlestick_15m" | "candlestick_30m"

export type CandleQuery = {
  asset: string;
  duration: ICandleDuration;   // "1m" | "5m" | "15m" | "30m"
  startTime: string;           // ISO string or epoch ms string
  endTime: string;
};