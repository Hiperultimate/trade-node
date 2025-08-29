import { MinPriorityQueue } from "@datastructures-js/priority-queue";
import { removeAssetAndTransferBalance } from "../db_query/removeAssetAndTransferBalance";
import { buy_orders } from "../store";

interface Order {
  orderId: string;
  price: number;
}

/**
 * Small helper: the queue may return either:
 * - an Order (when constructed with the priority extractor)
 * - or a wrapper { element: Order; priority: number }
 * The helper normalizes both cases to return an Order | null.
 */
function unwrapOrder(maybe: unknown): Order | null {
  if (!maybe) return null;
  // If it's the wrapper { element, priority }
  if (typeof maybe === "object" && maybe !== null && "element" in maybe) {
    // TS can't infer exact type here, so cast safely
    const w = maybe as { element: Order };
    return w.element;
  }
  // Otherwise assume it's the Order itself
  return maybe as Order;
}

export class TradeManager {
  private stopLossPQ = new MinPriorityQueue<Order>((o) => o.price);
  private takeProfitPQ = new MinPriorityQueue<Order>((o) => o.price);

  addOrder(orderId: string, stopLoss: number, takeProfit: number): void {
    this.stopLossPQ.enqueue({ orderId, price: stopLoss });
    this.takeProfitPQ.enqueue({ orderId, price: takeProfit });
    console.log("Order ADDED in Trade Manager: ", orderId);
  }

  onPriceUpdate(currentPrice: number): void {
    // StopLoss: trigger when currentPrice <= stopLossPrice
    while (!this.stopLossPQ.isEmpty()) {
      const frontItem = this.stopLossPQ.front(); // unknown shape
      const frontOrder = unwrapOrder(frontItem);
      if (!frontOrder) break;

      if (frontOrder.price >= currentPrice) {
        const dequeued = this.stopLossPQ.dequeue();
        const dqOrder = unwrapOrder(dequeued);
        if (!dqOrder) break;
        this.executeStopLoss(dqOrder.orderId, currentPrice);
        continue; // check next
      }

      break; // front not triggered
    }

    // TakeProfit: trigger when currentPrice >= takeProfitPrice
    while (!this.takeProfitPQ.isEmpty()) {
      const frontItem = this.takeProfitPQ.front();
      const frontOrder = unwrapOrder(frontItem);
      if (!frontOrder) break;

      if (frontOrder.price <= currentPrice) {
        const dequeued = this.takeProfitPQ.dequeue();
        const dqOrder = unwrapOrder(dequeued);
        if (!dqOrder) break;
        this.executeTakeProfit(dqOrder.orderId, currentPrice);
        continue;
      }

      break;
    }
  }

  private executeStopLoss(orderId: string, price: number): void {
    console.log(`StopLoss hit for ${orderId} at ${price}`);
    const userOrder = buy_orders[orderId]!;
    removeAssetAndTransferBalance(userOrder.username,orderId,price * userOrder.qty);
  }

  private executeTakeProfit(orderId: string, price: number): void {
    console.log(`TakeProfit hit for ${orderId} at ${price}`);
    const userOrder = buy_orders[orderId]!;
    removeAssetAndTransferBalance(userOrder.username,orderId,price* userOrder.qty);
  }
}
