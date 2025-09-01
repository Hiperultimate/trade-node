import { removeAssetFromUser } from "./removeAssetFromUser";
import { transferRequiredBalanceAmt } from "./transferRequiredBalanceAmt";

export async function removeAssetAndTransferBalance(
  username: string,
  order_id: string,
  currentAssetPrice?: number,
) {
  try {
    const isBalanceTransfered = await transferRequiredBalanceAmt(
      username,
      order_id,
      currentAssetPrice
    );
    const isAssetRemoved = await removeAssetFromUser(username, order_id);

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
