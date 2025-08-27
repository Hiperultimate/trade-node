import { WebSocketServer } from "ws";
import redisClient from "./redis_db";

const wss = new WebSocketServer({ port: 6767 });

redisClient.pSubscribe("*", (message, channel) => {
  console.log("Redis published:", { channel, message });
  
  // Broadcast to all connected WebSocket clients
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify({ channel, data: message }));
    }
  }
});

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

//   ws.on("message", function message(data) {
//     console.log("received: %s", data);
//   });

  ws.on("close", () => {
    console.log("Connection closed ws-feeder")
  })

  ws.send("Connected to ws-feeder");
});
