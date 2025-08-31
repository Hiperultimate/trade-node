import { useEffect, useState } from "react"
import { useWebSocket } from "./use-websocket";

export interface IQuotes {
  symbol: string;
  bidPrice: number;
  askPrice: number;
}

type IAssetList = Record<string, Omit<IQuotes,"symbol">>

function useLiveAssetPrices() {
    const [assetList, setAssetList] = useState<IAssetList>({});
    const getLiveAssetPrice = useWebSocket<IQuotes>(import.meta.env.VITE_WS_FEEDER as string);
    

    useEffect(() => {
        if (getLiveAssetPrice) { 
            setAssetList(prev => { 
                const toAdd = {};
                toAdd[getLiveAssetPrice.symbol] = {
                  bidPrice: getLiveAssetPrice.bidPrice,
                  askPrice: getLiveAssetPrice.askPrice,
                };
                return { ...prev, ...toAdd };
            })
        }
    }, [getLiveAssetPrice]);

    return assetList;

}

export default useLiveAssetPrices;