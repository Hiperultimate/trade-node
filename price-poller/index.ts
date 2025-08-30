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

const bidPriceIncrementRate = 0.0005;
const askPriceDecrementRate = 0.0005;

let ws = new WebSocket(binanceUrl);

// Streams in order for variable : streams
ws.addEventListener('message',async (event) => {
    const response : BinanceMarkPriceStreamMessage = JSON.parse(event.data);
    console.log("Base Price : ", response.data.P);

    const fetchedPrice = Number(response.data.P);
    const bidPrice = fetchedPrice - fetchedPrice * bidPriceIncrementRate;
    const askPrice = fetchedPrice + fetchedPrice * askPriceDecrementRate;
    console.log("New price : ", bidPrice, askPrice);
    await client.publish("BTC" , JSON.stringify({symbol: "BTC", askPrice, bidPrice}));
})
