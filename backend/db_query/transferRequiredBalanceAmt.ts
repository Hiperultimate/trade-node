import { users } from "../store";

export async function transferRequiredBalanceAmt(username : string, amtToAdd: number) {
  try {
    const isOrderDeleted = await new Promise((res, _) => {
      users[username]!.balance['USD']!.qty += amtToAdd;
      res(true);
    });
    return isOrderDeleted!;
  } catch (e) {
    return false; 
  }
}
