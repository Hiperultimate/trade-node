import client from "./redis_db";
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

const bidPriceIncrementRate = 0.001;
const askPriceDecrementRate = 0.001;

let ws = new WebSocket(binanceUrl);

// Streams in order for variable : streams
ws.addEventListener('message',async (event) => {
    const response : BinanceMarkPriceStreamMessage = JSON.parse(event.data);
    const symbol = response.data.s;
    const fetchedPrice = Number(response.data.P);
    const time = response.data.E;
    const bidPrice = fetchedPrice - fetchedPrice * bidPriceIncrementRate;
    const askPrice = fetchedPrice + fetchedPrice * askPriceDecrementRate;
    const payload = JSON.stringify({ symbol: symbol, askPrice, bidPrice, realPrice : fetchedPrice, time : time });
    
    console.log(`Base Price : ${response.data.P} :: New Price : ${payload}`);
  
    await client.publish(symbol, payload);
})
