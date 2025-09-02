import { users } from "../store";
import { getLatestAssetPrice } from "./getLatestAssetPrice";
import { getUserOrderDetails } from "./getUserOrders";

export async function transferRequiredBalanceAmt(username: string, order_id: string, currentAssetPrice?: number) {
  const getOrderDetails = await getUserOrderDetails(username, order_id);
  if (!getOrderDetails) return false;
  const { entryPrice, qty, leverage, margin, type } = getOrderDetails;

  if (currentAssetPrice === undefined) {
    const { bid_price, ask_price } = await getLatestAssetPrice(getOrderDetails.asset);
    console.log(`askPrice : ${ask_price} | bidPrice : ${bid_price}`)

    if(type === "buy"){
      currentAssetPrice = bid_price;
    }else{
      currentAssetPrice = ask_price;
    }
  }
  
  // Calculate pnl
  let pnl: number;
  if(type === "buy"){
    pnl = (currentAssetPrice - entryPrice) * qty * leverage;
  }else{
    pnl = (entryPrice - currentAssetPrice) * qty * leverage;
  }

  // Calculate the total price of the asset currently
  const amtToAdd = margin + pnl;

  console.log(`Crediting ${username}: Margin = ${margin}, PnL = ${pnl}, Total = ${amtToAdd}`);
  console.log(`Type : ${type} | Entry price : ${entryPrice} | Exit price : ${currentAssetPrice}`)

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
