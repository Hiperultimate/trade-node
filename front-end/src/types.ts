export interface IQuotes {
  symbol: string;
  bidPrice: number;
  askPrice: number;
}

export type ISignUpSuccess = {
    balance: { USD : { qty: number }},
    auth_token : string,
}