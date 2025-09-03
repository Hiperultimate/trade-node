export interface IQuotes {
  symbol: string;
  bidPrice: number;
  askPrice: number;
}

export type ISignUpSuccess = {
  balance: { USD: { qty: number } };
  auth_token: string;
};

export type ICandleStickFetch = {
  bucket: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type IPositionOrder = {
  asset: string;
  entryPrice: number;
  leverage: number;
  margin: number;
  order_id: string;
  qty: number;
  stopLoss: number;
  takeProfit: number;
  type: "buy" | "sell";
  username: string;
};

export type IPositionResponse = { balance : string, userOrders : IPositionOrder};
