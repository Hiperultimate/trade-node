import { users, holdingPositions } from "../store";
import { v4 as uuid } from "uuid";

export async function giveUserAsset(
  username: string,
  asset: string,
  assetPrice: number,
  leverage: number,
  qty: number,
  stopLoss: number | null = null,
  takeProfit: number | null = null
): Promise<undefined | string> {
  // Simulating a DB call
  try {
    const id = uuid();
    return await new Promise((res, _) => {
      // push order ID in holdingPositions
      if (!holdingPositions[username]) {
        holdingPositions[username] = [];
      }

      holdingPositions[username]?.push({
        username,
        order_id: id,
        asset,
        entryPrice: assetPrice,
        qty,
        margin: assetPrice * qty,
        stopLoss,
        takeProfit,
        leverage,
        type: "buy",
      });

      // push order ID in users.user_orders
      users[username]!.user_orders.push(id);
      res(id);
    });
  } catch (error) {
    return undefined;
  }
}
