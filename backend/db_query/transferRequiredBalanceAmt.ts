import { users } from "../store";
import { getLatestAssetPrice } from "./getLatestAssetPrice";
import { getUserOrderDetails } from "./getUserOrders";

export async function transferRequiredBalanceAmt(username: string, order_id: string, currentAssetPrice?: number) {
  const getOrderDetails = await getUserOrderDetails(username, order_id);
  if (!getOrderDetails) return false;
  const { entryPrice, qty, leverage, margin } = getOrderDetails;

  if (currentAssetPrice === undefined) {
    const { bid_price } = await getLatestAssetPrice(getOrderDetails.asset);
    currentAssetPrice = bid_price;
  }
  
  // Calculate pnl
  const pnl = (currentAssetPrice - entryPrice) * qty * leverage;

  // Calculate the total price of the asset currently
  const amtToAdd = margin + pnl;

  console.log(`Crediting ${username}: Margin = ${margin}, PnL = ${pnl}, Total = ${amtToAdd}`);
  console.log(`Entry price : ${entryPrice} | Exit price : ${currentAssetPrice}`)

  try {
    const isBalanceTransferred = await new Promise((res, _) => {
      users[username]!.balance['USD']!.qty += amtToAdd;
      res(true);
    });
    return isBalanceTransferred!;
  } catch (e) {
    return false; 
  }
}
