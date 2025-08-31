import { create } from "zustand";
import { IQuotes } from "@/types";


type IAssetList = Record<string, Omit<IQuotes,"symbol">>

interface IAssetPriceList {
  assetList: IAssetList;
  updateAssetList: (assetDetails : IQuotes) => void
}

export const useAssetPriceList = create<IAssetPriceList>((set) => ({
  assetList: {} as IAssetList,

  updateAssetList: (assetDetails: IQuotes) => {
    set((state) => ({
      assetList: {
        ...state.assetList,
        [assetDetails.symbol]: {
          bidPrice: assetDetails.bidPrice,
          askPrice: assetDetails.askPrice,
        },
      },
    }));
  },
}));