type CoinBalance = {
  qty: number;
  type?: 'buy' | 'sell';

};

type UserBalanceMap = {
  [coinName: string]: CoinBalance;
};

export type Users = {
  [userId: string]: {
    balance: UserBalanceMap;    
  };
};

export type IFetchAssetDetails = {
    time: Date,
    symbol: string,
    bid_price: number,
    ask_price: number
}[]