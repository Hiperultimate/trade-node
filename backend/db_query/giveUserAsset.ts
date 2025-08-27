import { userBalance } from "../store";

export async function giveUserAsset(
  username: string,
  asset: string,
  qty: number
) : Promise<boolean> {
  const userData = userBalance[username]!;

  // Simulating a DB call
  try {
    const existingBalance = userData.balance[asset] ? userData.balance[asset].qty : 0;
    return await new Promise((res, _) => {
      userData.balance[asset] = { qty : existingBalance + qty, type: "buy" };
      res(true);
    });
  } catch (error) {
    return false;
  }
}
