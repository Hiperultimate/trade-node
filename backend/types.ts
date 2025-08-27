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
