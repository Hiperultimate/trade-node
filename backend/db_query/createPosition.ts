import { holdingPositions, users } from "../store";
import { v4 as uuid } from "uuid";

function createPosition(
  username: string,
  asset: string,
  entryPrice: number,
  margin: number,
  qty: number,
  stopLoss: number | null = null,
  takeProfit: number | null = null,
  leverage: number,
  type: "buy" | "sell"
) {
  const orderId = uuid();

  if (!holdingPositions[username]) {
    holdingPositions[username] = [];
  }

  holdingPositions[username].push({
    username,
    order_id: orderId,
    asset,
    entryPrice,
    margin,
    qty,
    stopLoss,
    takeProfit,
    leverage,
    type,
  });

  // push order ID in users.user_orders
  users[username]!.user_orders.push(orderId);

  console.log("Order created! :", orderId);
  return orderId;
}

export default createPosition;