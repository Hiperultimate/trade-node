import { removeAssetAndTransferBalance } from "../db_query/removeAssetAndTransferBalance";
import { holdingPositions } from "../store";
import type { IPubQuotes } from "../types";


export async function liquidateLowValuePositions(currentAssetDetails : IPubQuotes) {
  // Go through each position
  const allPositionsArr = Object.values(holdingPositions).flat();
  
  for (let i = 0; i < allPositionsArr.length ; i++){
    const position = allPositionsArr[i]!;
    const {
      username,
      order_id,
      asset,
      entryPrice,
      qty,
      margin,
      leverage,
      type,
      stopLoss,
      takeProfit,
    } = position;
    const { askPrice, bidPrice, symbol } = currentAssetDetails;

    if (type === "buy") {
      // Long: Use bidPrice
      if (stopLoss && bidPrice <= stopLoss) {
        removeAssetAndTransferBalance(username, order_id, bidPrice);
        console.log(
          `Stop-loss triggered for long position: bidPrice (${bidPrice}) <= stopLoss (${stopLoss})`
        );
        continue; 
      } else if (takeProfit && bidPrice >= takeProfit) {
        removeAssetAndTransferBalance(username, order_id, bidPrice);
        console.log(
          `Take-profit triggered for long position: bidPrice (${bidPrice}) >= takeProfit (${takeProfit})`
        );
        continue; 
      }
    } else {
      // Short: Use askPrice
      if (stopLoss && askPrice >= stopLoss) {
        removeAssetAndTransferBalance(username, order_id, askPrice);
        console.log(
          `Stop-loss triggered for short position: askPrice (${askPrice}) >= stopLoss (${stopLoss})`
        );
        continue; 
      } else if (takeProfit && askPrice <= takeProfit) {
        removeAssetAndTransferBalance(username, order_id, askPrice);
        console.log(
          `Take-profit triggered for short position: askPrice (${askPrice}) <= takeProfit (${takeProfit})`
        );
        continue;
      }
    }

    if (leverage <= 1 || asset !== symbol) continue;

    let pnl: number;
    let currentNotional: number; // Price of asset right now
    if (type === "buy") {
      // Long
      pnl = qty * (bidPrice - entryPrice) * leverage;
      currentNotional = bidPrice * qty;
    } else {
      // Short (sell)
      pnl = qty * (entryPrice - bidPrice) * leverage;
      currentNotional = askPrice * qty;
    }

    // Total worth of your bought asset
    const equity = margin + pnl;

    const MAINTAINENCE_MARGIN = 0.1; // Minimum amount required to keep the position open when comes to leverage > 1
    const maintenance_margin = MAINTAINENCE_MARGIN * currentNotional;

    // console.log(`${maintenance_margin} >= ${equity} == ${maintenance_margin >= equity}`);

    if (maintenance_margin >= equity) {
      // Liquidate position
      const exitPrice = type === "buy" ? bidPrice : askPrice;
      removeAssetAndTransferBalance(username, order_id, exitPrice);
      console.log(`Maintenance margin price hit ${currentNotional} * ${MAINTAINENCE_MARGIN} >= ${margin} + ${pnl} `);
    }
  }
}