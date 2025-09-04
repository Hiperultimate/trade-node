import { UTCTimestamp } from 'lightweight-charts';

export interface IQuotes {
  symbol: string;
  bidPrice: number;
  askPrice: number;
  time : number;
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

export type IAssetList = Record<string, Omit<IQuotes, "symbol">>;

export type ITimeDuration = "1m" | "5m" | "15m" | "30m";

export type ChartData = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export enum ChartInterval {
  OneMinute = "1m",
  FiveMinutes = "5m",
  FifteenMinutes = "15m",
  ThirtyMinutes = "30m"
}