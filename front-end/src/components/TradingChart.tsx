import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAssetPriceList } from '@/store/assetPriceList';
import { ICandleStickFetch } from '@/types';
import { UTCTimestamp } from 'lightweight-charts';
import CandlestickChart from "./CandlestickChart";

interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TradingChartProps {
  selectedAsset: string;
}

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
];

const TradingChart = ({ selectedAsset }: TradingChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const selectedAssetPrice = useAssetPriceList(s => s.assetList[selectedAsset].askPrice);

  const {
    data: candleStickData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["candlestick", selectedTimeframe, selectedAsset],
    queryFn: async () => {
      const now = new Date(); // .getTime() converts the Date object to milliseconds
      const thirtyDaysAgoDate = new Date();
      thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
      const before30Days = thirtyDaysAgoDate;
      const response = await axios.get<ICandleStickFetch[]>(
        `${import.meta.env.VITE_BACKEND}/candles`,
        {
          params: {
            asset: selectedAsset,
            duration: selectedTimeframe,
            startTime: before30Days.toISOString(),
            endTime: now.toISOString(),
          },
        }
      );

      return response.data;
    },
  });

  useEffect(() => { 
    if (!candleStickData) return;
    const cleanChart = candleStickData.map(record => { 
      // const time = new Date(record.bucket);
      if(record.low > record.high){
        console.log("Invalid data : " , JSON.stringify(record));
      }
      return {
        time: (new Date(record.bucket).getTime() / 1000) as UTCTimestamp,
        symbol: record.symbol,
        open: record.open,
        high: record.high,
        low: record.low,
        close: record.close,
      };
    })

    setChartData(cleanChart);
    // console.log("Getting chart data from DB:", cleanChart);


  },[candleStickData])


  return (
    <Card className="flex-1 bg-panel-bg border-panel-border h-full">
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedAsset}
            </h2>
            <div className="text-2xl font-mono text-foreground">
              {selectedAssetPrice.toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}
            </div>
          </div>
        </div>

        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={selectedTimeframe === tf.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTimeframe(tf.value)}
              className={cn(
                "h-8 px-3 text-xs",
                selectedTimeframe === tf.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-hover"
              )}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-full p-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="h-full">
            <CandlestickChart candleData={chartData}/>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TradingChart;