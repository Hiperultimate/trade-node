import { holdingPositions, users } from "../store";

export async function removeAssetFromUser(username: string, order_id: string) {
  try {
    // Removing order_id from users store
    const userOrders = users[username]!.user_orders;
    users[username]!.user_orders = userOrders.flatMap((id) =>
      id !== order_id ? [id] : []
    );

    const isOrderDeleted = await new Promise((res, _) => {
      // removing order_id from holdingPositions
      holdingPositions[username] = holdingPositions[username]!.filter(
        (item) => item.order_id !== order_id
      );
      res(true);
    });
    return isOrderDeleted!;
  } catch (e) {
    return false; 
  }
}
