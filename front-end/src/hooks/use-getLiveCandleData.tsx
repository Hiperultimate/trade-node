import { useAssetPriceList } from "@/store/assetPriceList";
import { ChartData, ChartInterval, IAssetList, ITimeDuration } from "@/types";
import { UTCTimestamp } from "lightweight-charts";
import { useEffect, useRef } from "react";

type OHLCCharts = {
  [assetName: string]: {
    [duration in ITimeDuration]: ChartData | {};
  };
};

function useGetLiveCandleData() {
  const assetPriceList = useAssetPriceList((s) => s.assetList); // Has the latest price updates
  const currentAssetOHLC = useRef<OHLCCharts>({});
  const existingGraphData = useAssetPriceList((s) => s.candleStickRecord);
  const alterLatestCandleStick = useAssetPriceList((s) => s.alterLatestCandleStick);
  const appendLatestCandlestick = useAssetPriceList(
    (s) => s.appendLatestCandleStick
  );
  const currentWatchAssets = Object.keys(assetPriceList);

  const assetPriceListRef = useRef<IAssetList>({});

  useEffect(() => {
    currentWatchAssets.forEach((assetName) => {
      const price =
        (assetPriceList[assetName].askPrice +
          assetPriceList[assetName].bidPrice) /
        2;
      [
        ChartInterval.OneMinute,
        ChartInterval.FiveMinutes,
        ChartInterval.FifteenMinutes,
        ChartInterval.ThirtyMinutes,
      ].forEach((duration: ITimeDuration) => {
        const assetData = currentAssetOHLC.current[assetName];
        if (!existingGraphData[assetName]) return;
        if (!assetData) {
          currentAssetOHLC.current[assetName] = {
            [ChartInterval.OneMinute]: {},
            [ChartInterval.FiveMinutes]: {},
            [ChartInterval.FifteenMinutes]: {},
            [ChartInterval.ThirtyMinutes]: {},
          };
        }

        const prev = currentAssetOHLC.current[assetName][duration] as ChartData;

        // ✅ if no prev candle, start with fresh one
        if (!prev || !prev.open) {
            const updateWick = {
            open: price,
            high: price,
            low: price,
            close: price,
            time: Math.floor(
              assetPriceList[assetName].time / 1000
            ) as UTCTimestamp,
            symbol: assetName,
            altering : true,
          }
          currentAssetOHLC.current[assetName][duration] = updateWick;
          alterLatestCandleStick(assetName, updateWick);
        } else {
          // ✅ update highs/lows instead of overwriting
          const updateWick = {
            open : prev.open,
            high: Math.max(prev.high, price),
            low: Math.min(prev.low, price),
            close: price,
            time: Math.floor(
              assetPriceList[assetName].time / 1000
            ) as UTCTimestamp,
            altering : true
          }
          currentAssetOHLC.current[assetName][duration] = {
            ...prev,
            ...updateWick
          };
          alterLatestCandleStick(assetName, updateWick);
        }
      });
    });
  }, [assetPriceList]);

  useEffect(() => {
    assetPriceListRef.current = assetPriceList;
  }, [assetPriceList]);

  useEffect(() => {
    const timer1m = setInterval(() => {
      const currentWatchAssets = Object.keys(assetPriceListRef.current);
      currentWatchAssets.forEach((assetName) => {
        const oneMinuteWickData =
          currentAssetOHLC.current[assetName][ChartInterval.OneMinute];
        if (!(Object.keys(oneMinuteWickData).length === 0)) {
          appendLatestCandlestick(assetName, oneMinuteWickData as ChartData);
        }
        currentAssetOHLC.current[assetName] = {
          ...currentAssetOHLC.current[assetName],
          [ChartInterval.OneMinute]: {},
        };
      });
    }, 1 * 60 * 1000);

    const timer5m = setInterval(() => {
      const currentWatchAssets = Object.keys(assetPriceListRef.current);
      currentWatchAssets.forEach((assetName) => {
        const fiveMinuteWickData =
          currentAssetOHLC.current[assetName][ChartInterval.FiveMinutes];
        if (!(Object.keys(fiveMinuteWickData).length === 0)) {
          appendLatestCandlestick(assetName, fiveMinuteWickData as ChartData);
        }
        currentAssetOHLC.current[assetName] = {
          ...currentAssetOHLC.current[assetName],
          [ChartInterval.FiveMinutes]: {},
        };
      });
    }, 5 * 60 * 1000);

    const timer15m = setInterval(() => {
      const currentWatchAssets = Object.keys(assetPriceListRef.current);
      currentWatchAssets.forEach((assetName) => {
        const fifteenMinuteWickData =
          currentAssetOHLC.current[assetName][ChartInterval.FifteenMinutes];
        if (!(Object.keys(fifteenMinuteWickData).length === 0)) {
          appendLatestCandlestick(
            assetName,
            fifteenMinuteWickData as ChartData
          );
        }
        currentAssetOHLC.current[assetName] = {
          ...currentAssetOHLC.current[assetName],
          [ChartInterval.FifteenMinutes]: {},
        };
      });
    }, 15 * 60 * 1000);

    const timer30m = setInterval(() => {
      const currentWatchAssets = Object.keys(assetPriceListRef.current);
      currentWatchAssets.forEach((assetName) => {
        const thirtyMinuteWickData =
          currentAssetOHLC.current[assetName][ChartInterval.ThirtyMinutes];
        if (!(Object.keys(thirtyMinuteWickData).length === 0)) {
          appendLatestCandlestick(assetName, thirtyMinuteWickData as ChartData);
        }
        currentAssetOHLC.current[assetName] = {
          ...currentAssetOHLC.current[assetName],
          [ChartInterval.ThirtyMinutes]: {},
        };
      });
    }, 30 * 60 * 1000);

    return () => {
      clearInterval(timer1m);
      clearInterval(timer5m);
      clearInterval(timer15m);
      clearInterval(timer30m);
    };
  }, []);
}

export default useGetLiveCandleData;

// open high low close -> open high low close=currentValue
