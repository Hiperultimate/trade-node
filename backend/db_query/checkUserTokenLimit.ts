import { users } from "../store";

export async function checkUserTokenLimit(username: string, asset: string, requiredQty: number) {
    const userData = users[username]!;
    const userCoin = userData.balance[asset]!;
    if(userCoin.qty>= requiredQty){
        return true
    }
    return false;
}