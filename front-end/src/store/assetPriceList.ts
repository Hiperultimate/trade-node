import { create } from "zustand";
import { IAssetList, IAssetPriceList, IQuotes } from "@/types";

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