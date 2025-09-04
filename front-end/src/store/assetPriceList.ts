import { create } from "zustand";
import { ChartData, IAssetList, IQuotes } from "@/types";

export type IAssetPriceList = {
  assetList: IAssetList;
  candleStickRecord: Record<string, (ChartData & {altering? : boolean})[]>;
  updateAssetList: (assetDetails: IQuotes) => void;
  updateCandleStickRecord : (symbol : string, graphData : ChartData[]) => void;
  appendLatestCandleStick: (symbol : string, newCandle :  (ChartData & {altering? : boolean})) => void;
  alterLatestCandleStick: (symbol : string, newCandle : (ChartData & {altering? : boolean})) => void;
};

export const useAssetPriceList = create<IAssetPriceList>((set) => ({
  assetList: {} as IAssetList,
  candleStickRecord : {} as Record<string, ChartData[]>,

  updateAssetList: (assetDetails: IQuotes) => {
    set((state) => {
      return {
        assetList: {
          ...state.assetList,
          [assetDetails.symbol]: {
            bidPrice: assetDetails.bidPrice,
            askPrice: assetDetails.askPrice,
            time : assetDetails.time,
          },
        },
    }
    });
  },

  updateCandleStickRecord : (symbol : string, graphData : ChartData[]) => {
    set((state) => ({
      candleStickRecord : {
        ...state.candleStickRecord,
        [symbol] : graphData,
      }
    }))
  },

  appendLatestCandleStick : (symbol : string, newCandle :  (ChartData & {altering? : boolean})) => {
    set((state) => {
      const lastItem = state.candleStickRecord[symbol].at(-1);

      // Altering stick found, replacing altering stick with confirmed stick
      if(lastItem && lastItem.altering){
        // console.log("Altering found... replacing this ->", lastItem);
        delete newCandle.altering;
        const updatedSeries = [...state.candleStickRecord[symbol]];
        updatedSeries[updatedSeries.length - 1] = newCandle;

        return {
          candleStickRecord : { [symbol] : updatedSeries}
        }
      }

      // Altering stick not found, appending as normal
      return {
        candleStickRecord : { [symbol] : [...state.candleStickRecord[symbol], newCandle]},
      }
    })
  },

  alterLatestCandleStick : (symbol : string, newCandle : (ChartData & {altering? : boolean})) => {
    set((state) => {
    const prevRecords = state.candleStickRecord || {};
    const series = prevRecords[symbol] ?? [];

    if (series.length === 0) {
      return {
        candleStickRecord: {
          ...prevRecords,
          [symbol]: [newCandle],
        },
      };
    }

    const updatedSeries = [...series];

    // Real stick found, appending altering stick
    if(!updatedSeries[updatedSeries.length - 1].altering){
      newCandle = {...newCandle, altering : true};
      // console.log("Altering stick not found... creating one..." , newCandle);
      return {
        candleStickRecord : {
          ...prevRecords,
          [symbol] : [...updatedSeries, newCandle]
        }
      }
    }
    
    // Altering stick found, altering the same stick
    updatedSeries[updatedSeries.length - 1] = newCandle;
    return {
      candleStickRecord: {
        ...prevRecords,
        [symbol]: updatedSeries,
      },
    };
  });
  },
}));