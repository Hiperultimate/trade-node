import type { BinanceMarkPriceStreamMessage } from "./types";

// let streams = ['bnbusdt','btcusdt'];
let streams = ['btcusdt'];
let binance_wss_url = 'wss://fstream.binance.com/'; 
// let binance_url = 'wss://fstream.binance.com/stream?streams=bnbusdt@aggTrade/btcusdt@markPrice';

const streamList = streams.map(symbol =>
  `${symbol.toLowerCase()}@markPrice`
).join('/');

// Construct the full URL
const binance_url = `${binance_wss_url}stream?streams=${streamList}`;
console.log(binance_url);

let ws = new WebSocket(binance_url);

// Streams in order for variable : streams
ws.addEventListener('message', (event) => {
    // console.log('Receiving : ', event.data);
    const response : BinanceMarkPriceStreamMessage = JSON.parse(event.data);
    console.log("Price : ", response.data.P);
})
