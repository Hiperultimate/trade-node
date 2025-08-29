import { removeAssetFromUser } from "./removeAssetFromUser";
import { transferRequiredBalanceAmt } from "./transferRequiredBalanceAmt";

export async function removeAssetAndTransferBalance(
  username: string,
  order_id: string,
  currentAssetPrice: number, // In USD (qty * asset price)
) {
  try {
    const isAssetRemoved = await removeAssetFromUser(username, order_id);
    const isBalanceTransfered = await transferRequiredBalanceAmt(
      username,
      currentAssetPrice
    );

    const isOrderDeleted = await new Promise((res, _) => {
      if (!(isAssetRemoved && isBalanceTransfered)) {
        res(false);
        }
      res(true);
    });
    return isOrderDeleted!;
  } catch (e) {
    return false;
  }
}
