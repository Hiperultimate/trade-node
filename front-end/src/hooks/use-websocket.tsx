import { useEffect, useState } from "react"

export function useWebSocket<T>(wsURL: string) {
    const [data, setData] = useState<T>();

  useEffect(() => {
    const socket = new WebSocket(wsURL);
    socket.addEventListener("open", () => {
      console.log("Connected to : ", wsURL);
    });

    socket.addEventListener("message", async (event) => {
      // normalize to string
      let text: string;
      if (typeof event.data === "string") {
        text = event.data;
      } else if (event.data instanceof Blob) {
        text = await event.data.text();
      } else if (event.data instanceof ArrayBuffer) {
        text = new TextDecoder().decode(event.data);
      } else {
        console.warn("Unknown websocket data type:", event.data);
        return;
      }

      // try parse JSON, otherwise ignore or handle raw text
      try {
        const parsed = JSON.parse(text);
        setData(parsed as T);
      } catch (err) {
        console.warn("WebSocket: non-JSON message received:", text);
      }
    });
      
    socket.addEventListener("error", (event) => {
        console.log("WebSocket error:", event);
    });

    return () => socket.close();
  }, [wsURL])

    return data;
}
