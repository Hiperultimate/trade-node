import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingChartProps {
  selectedAsset: string;
}

const timeframes = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' }
];

const TradingChart = ({ selectedAsset }: TradingChartProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Generate mock OHLC data
  useEffect(() => {
    const generateData = () => {
      const basePrice = selectedAsset === 'BTC' ? 108800 : 
                       selectedAsset === 'XAUUSD' ? 3450 :
                       selectedAsset === 'AAPL' ? 232 : 1.165;
      
      const data = [];
      let price = basePrice;
      
      for (let i = 30; i >= 0; i--) {
        const time = new Date();
        time.setMinutes(time.getMinutes() - i * 15);
        
        const volatility = basePrice * 0.002;
        const change = (Math.random() - 0.5) * volatility;
        
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          open: Number(open.toFixed(selectedAsset === 'BTC' ? 2 : 5)),
          high: Number(high.toFixed(selectedAsset === 'BTC' ? 2 : 5)),
          low: Number(low.toFixed(selectedAsset === 'BTC' ? 2 : 5)),
          close: Number(close.toFixed(selectedAsset === 'BTC' ? 2 : 5)),
          volume: Math.floor(Math.random() * 1000) + 100
        });
        
        price = close;
      }
      
      setChartData(data);
      setCurrentPrice(data[data.length - 1]?.close || basePrice);
    };

    generateData();
    const interval = setInterval(generateData, 5000);
    return () => clearInterval(interval);
  }, [selectedAsset, selectedTimeframe]);

  return (
    <Card className="flex-1 bg-panel-bg border-panel-border h-full">
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">{selectedAsset}</h2>
            <div className="text-2xl font-mono text-foreground">
              {currentPrice.toLocaleString(undefined, { 
                minimumFractionDigits: selectedAsset === 'BTC' ? 2 : 5,
                maximumFractionDigits: selectedAsset === 'BTC' ? 2 : 5 
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

      <div className="h-[calc(100%-140px)] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={['dataMin - 0.1%', 'dataMax + 0.1%']}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default TradingChart;