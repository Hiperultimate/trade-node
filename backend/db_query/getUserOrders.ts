import { holdingPositions } from "../store";
import type { IPosition } from "../types";

export async function getUserOrders(username: string) {
  try {
    const orders :IPosition[] | undefined = await new Promise((res, _) => {
      const userOrders = holdingPositions[username];
      res(userOrders);
    });
    return orders;
  } catch (e) {
    return null; // No user found
  }
}

export async function getUserOrderDetails(username: string, order_id: string) {
  const userOrderDetails = holdingPositions[username]?.find(item => item.order_id === order_id);
  return userOrderDetails
  
}
