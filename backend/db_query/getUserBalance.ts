import { userBalance } from "../store";

export async function getUserBalance(username: string) {
  try {
    const balance = await new Promise((res, _) => {
      const getBalance = userBalance[username];
      res(getBalance);
    });
    return balance!;
  } catch (e) {
    return {}; // No user found
  }
}
