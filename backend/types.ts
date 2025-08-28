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
    qty: number, // 0.002
    margin: number, // 100 (money spent in $)
    leverage: number, // (1-100x multipler)
    asset_bought_price: number, // 110000
    asset: string, // "BTC" | "ETH" etc
    type: "buy" | "sell"
}