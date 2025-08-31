import { useEffect } from "react"
import { useWebSocket } from "./use-websocket";
import { IQuotes } from "@/types";
import { useAssetPriceList } from "@/store/assetPriceList";

// Connects to WS server and keeps updating price for assetList
function useLiveAssetPrices() {
    const setAssetList = useAssetPriceList((s) => s.updateAssetList);
    const getLiveAssetPrice = useWebSocket<IQuotes>(import.meta.env.VITE_WS_FEEDER as string);

    useEffect(() => {
        if (getLiveAssetPrice) { 
            setAssetList(getLiveAssetPrice);
        }
    }, [getLiveAssetPrice, setAssetList]);

}

export default useLiveAssetPrices;