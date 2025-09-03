import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useUserSession } from "@/store/userData";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IPositionOrder } from "@/types";
import { useAssetPriceList } from "@/store/assetPriceList";

interface Position {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  qty: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  leverage: number;
  // openTime: string;
}

const PositionsList = () => {
  const user = useUserSession((s) => s.user);
  const setUserBalance = useUserSession((s) => s.updateCurrentUserBalance);
  const currentAssetPrices = useAssetPriceList((s) => s.assetList);
  const {
    data: allPositions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["positions", user],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND}/order`,
        { params: { username: user.username } }
      );
      setUserBalance(response.data.balance["USD"]["qty"] || 0);
      // console.log("checking all orders : ", response.data);

      const filterData = response.data.userOrders.map(
        (item: IPositionOrder) => {
          const currentAssetPrice = currentAssetPrices[item.asset];
          let priceDiff: number;
          if (item.type === "buy") {
            priceDiff = currentAssetPrice.bidPrice - item.entryPrice;
          } else {
            priceDiff = item.entryPrice - currentAssetPrice.askPrice;
          }
          const pnl = item.qty * priceDiff * item.leverage;
          return {
            id: item.order_id,
            symbol: item.asset,
            type: item.type,
            qty: item.qty,
            openPrice: item.entryPrice,
            currentPrice:
              item.type === "buy"
                ? currentAssetPrice.bidPrice
                : currentAssetPrice.askPrice,
            pnl: pnl,
            pnlPercent: ((priceDiff * item.leverage) / item.entryPrice) * 100,
            leverage: Number(item.leverage),
          };
        }
      );

      console.log("Checking filtered data : ", filterData);
      setPositions(filterData);
      return filterData;
    },
  });
  const [positions, setPositions] = useState<Position[]>([]);

  // Simulate real-time P/L updates
  useEffect(() => {
    setPositions((prev) =>
      prev.map((position) => {
        if (!position.symbol || !currentAssetPrices[position.symbol]) {
          return;
        }
        // const volatility = 0.001;
        // const change = (Math.random() - 0.5) * volatility * position.currentPrice;
        let newCurrentPrice: number;
        if (position.type === "buy") {
          newCurrentPrice = currentAssetPrices[position.symbol].bidPrice;
        } else {
          newCurrentPrice = currentAssetPrices[position.symbol].askPrice;
        }

        const priceDiff =
          position.type === "buy"
            ? newCurrentPrice - position.openPrice
            : position.openPrice - newCurrentPrice;

        const newPnl = priceDiff * position.qty;
        const newPnlPercent =
          ((priceDiff * position.leverage) / position.openPrice) * 100;

        return {
          ...position,
          currentPrice: Number(newCurrentPrice.toFixed(2)),
          pnl: Number(newPnl.toFixed(2)),
          pnlPercent: Number(newPnlPercent.toFixed(3)),
        };
      })
    );
  }, [currentAssetPrices]);

  const closePosition = (id: string) => {
    // setPositions(prev => prev.filter(pos => pos.id !== id));
  };

  const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <Card className="bg-panel-bg border-panel-border">
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">
            Open Positions
          </h2>
          <div className="text-sm">
            <span className="text-muted-foreground">Total P/L: </span>
            <span
              className={cn(
                "font-mono font-medium",
                totalPnL >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-muted-foreground text-sm">No open positions</div>
        </div>
      ) : (
        <div className="divide-y divide-panel-border h-72 overflow-y-scroll">
          {positions.map((position) => (
            <div
              key={position.id}
              className="p-4 hover:bg-hover transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-foreground">
                    {position.symbol}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      position.type === "buy"
                        ? "bg-buy/10 text-buy border border-buy/20"
                        : "bg-sell/10 text-sell border border-sell/20"
                    )}
                  >
                    {position.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {position.qty} lots
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closePosition(position.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <div className="text-muted-foreground mb-1">Open Price</div>
                  <div className="font-mono text-foreground">
                    {position.openPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">
                    Current Price
                  </div>
                  <div className="font-mono text-foreground">
                    {position.currentPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">P/L</div>
                  <div
                    className={cn(
                      "font-mono font-medium",
                      position.pnl >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">P/L %</div>
                  <div
                    className={cn(
                      "font-mono font-medium",
                      position.pnlPercent >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {position.pnlPercent >= 0 ? "+" : ""}
                    {position.pnlPercent.toFixed(3)}%
                  </div>
                </div>
              </div>

              {/* <div className="mt-2 text-xs text-muted-foreground">
                Opened: {position.openTime}
              </div> */}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PositionsList;
