export interface IQuotes {
  symbol: string;
  bidPrice: number;
  askPrice: number;
}

export type ISignUpSuccess = {
    balance: { qty: number },
    auth_token : string,
}