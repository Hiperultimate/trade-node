export interface IBinanceResponse {
  e: "markPriceUpdate";  // Event type
  E: number;             // Event timestamp (ms)
  s: string;             // Symbol (e.g., "BNBUSDT")
  p: string;             // Mark price
  i: string;             // Index price
  P: string;             // Estimated settle price
  r: string;             // Funding rate
  T: number;             // Next funding time (ms)
}

export interface BinanceMarkPriceStreamMessage {
  stream: `${string}@markPrice`;  // Stream identifier, e.g., "bnbusdt@markPrice"
  data: IBinanceResponse;
}
