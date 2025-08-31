export interface IQuotes {
  symbol: string;
  bidPrice: number;
  askPrice: number;
}

export type ISignUpSuccess = {
    balance: { USD : { qty: number }},
    auth_token : string,
}

export type ICandleStickFetch = {
    bucket: string,
    symbol: string,
    open: number,
    high: number,
    low: number,
    close: number
}