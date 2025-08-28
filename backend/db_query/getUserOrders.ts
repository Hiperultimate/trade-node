import { buy_orders, users } from "../store";

export async function getUserOrders(username: string) {
  try {
    const orders = await new Promise((res, _) => {
      const userOrderIds = users[username]!.user_orders;
      const allOrders = userOrderIds.map(id => {
        return buy_orders[id];
      })
      res(allOrders);
    });
    return orders!;
  } catch (e) {
    return {}; // No user found
  }
}
