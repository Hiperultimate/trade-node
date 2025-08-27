import { userBalance } from "../store";

export async function deductUserBalance(
  username: string,
  asset: string,
  reduceQty: number
) : Promise<boolean> {
  try {
    return await new Promise((res, rej) => {
      userBalance[username]!.balance[asset]!.qty -= reduceQty;
      res(true);
    });
  } catch (error) {
    return false;
  }
}
