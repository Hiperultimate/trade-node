import { users, buy_orders } from "../store";
import { v4 as uuid } from "uuid";

export async function giveUserAsset(
  username: string,
  asset: string,
  assetPrice: number,
  leverage: number,
  qty: number
): Promise<boolean> {
  const userData = users[username]!;

  // Simulating a DB call
  try {
    const id = uuid();
    return await new Promise((res, _) => {
      // push order ID in buy_orders
      buy_orders[id] = {
        asset: asset,
        asset_bought_price: assetPrice,
        leverage: leverage,
        margin: assetPrice * qty, // The total price invested in the stock
        qty: qty,
        type: "buy",
      };
      // push order ID in users.user_orders
      users[username]!.user_orders.push(id);
      res(true);
    });
  } catch (error) {
    return false;
  }
}
