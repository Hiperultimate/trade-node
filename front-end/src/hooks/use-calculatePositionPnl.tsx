import { useAssetPriceList } from "@/store/assetPriceList";
import { useUserSession } from "@/store/userData";
import { useEffect, useState } from "react";

// This needs fixing
function useCalculateAllPositionPnl() {
    const [totalPnl, setTotalPnl] = useState(0);
    const userPositions = useUserSession((s) => s.userPositions);
    const currentAssetPrices = useAssetPriceList((s) => s.assetList);

    useEffect(() => {
        if(!userPositions) return;
        const calculatedPnlList = userPositions.map(position => {
            if (!position.asset || !currentAssetPrices[position.asset]) {
                return;
            }
            let newCurrentPrice: number;
            if (position.type === "buy") {
                newCurrentPrice = currentAssetPrices[position.asset].bidPrice;
            } else {
                newCurrentPrice = currentAssetPrices[position.asset].askPrice;
            }

            const priceDiff =
                position.type === "buy"
                    ? newCurrentPrice - position.entryPrice
                    : position.entryPrice - newCurrentPrice;

            const newPnl = priceDiff * position.qty * position.leverage;
            return position.margin + newPnl;
        });

        setTotalPnl(calculatedPnlList.reduce((total, current) => total + current, 0));

    }, [currentAssetPrices, userPositions]);

    return totalPnl;

}

export default useCalculateAllPositionPnl;