import { users } from "../store";

export async function getUserBalance(username: string) {
  try {
    const balance = await new Promise((res, _) => {
      const getBalance = users[username]!.balance;
      res(getBalance);
    });
    return balance!;
  } catch (e) {
    return {}; // No user found
  }
}
