import type { BinanceMarkPriceStreamMessage } from "./types";

// let streams = ['bnbusdt','btcusdt'];
// let binanceUrl = 'wss://fstream.binance.com/stream?streams=bnbusdt@aggTrade/btcusdt@markPrice';
let streams = ['btcusdt'];
let binanceWsURL = 'wss://fstream.binance.com/'; 

const streamList = streams.map(symbol =>
  `${symbol.toLowerCase()}@markPrice`
).join('/');

// Construct the full URL
const binanceUrl = `${binanceWsURL}stream?streams=${streamList}`;
console.log(binanceUrl);

let ws = new WebSocket(binanceUrl);

// Streams in order for variable : streams
ws.addEventListener('message', (event) => {
    const response : BinanceMarkPriceStreamMessage = JSON.parse(event.data);
    console.log("Price : ", response.data.P);
})
