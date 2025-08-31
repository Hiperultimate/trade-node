import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Asset {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
}

interface AssetListProps {
  selectedAsset: string;
  onAssetSelect: (symbol: string) => void;
}

const AssetList = ({ selectedAsset, onAssetSelect }: AssetListProps) => {
  const [assets, setAssets] = useState<Asset[]>([
    { symbol: 'BTC', name: 'Bitcoin', bid: 108782.41, ask: 108804.01, change: -259.61, changePercent: -0.24 },
    { symbol: 'XAUUSD', name: 'Gold vs USD', bid: 3448.935, ask: 3450.44, change: 12.45, changePercent: 0.36 },
    { symbol: 'AAPL', name: 'Apple Inc.', bid: 232.64, ask: 232.68, change: -1.23, changePercent: -0.52 },
    { symbol: 'EURUSD', name: 'Euro vs USD', bid: 1.1651, ask: 1.1653, change: 0.0012, changePercent: 0.10 },
    { symbol: 'GBPUSD', name: 'Pound vs USD', bid: 1.3419, ask: 1.3421, change: -0.0089, changePercent: -0.66 },
    { symbol: 'USDJPY', name: 'USD vs Yen', bid: 147.835, ask: 147.845, change: 0.215, changePercent: 0.15 },
    { symbol: 'USTEC', name: 'US Tech 100', bid: 23418.76, ask: 23420.12, change: 156.34, changePercent: 0.67 },
    { symbol: 'USOIL', name: 'US Crude Oil', bid: 63.741, ask: 63.759, change: -0.891, changePercent: -1.37 }
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const volatility = 0.001;
        const change = (Math.random() - 0.5) * volatility * asset.bid;
        const newBid = asset.bid + change;
        const newAsk = newBid + (asset.ask - asset.bid);
        const newChange = change;
        const newChangePercent = (change / asset.bid) * 100;
        
        return {
          ...asset,
          bid: Number(newBid.toFixed(asset.symbol === 'BTC' || asset.symbol === 'USTEC' ? 2 : 5)),
          ask: Number(newAsk.toFixed(asset.symbol === 'BTC' || asset.symbol === 'USTEC' ? 2 : 5)),
          change: Number((asset.change + newChange).toFixed(asset.symbol === 'BTC' || asset.symbol === 'USTEC' ? 2 : 5)),
          changePercent: Number((asset.changePercent + newChangePercent).toFixed(2))
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-80 bg-panel-bg border-panel-border h-full">
      <div className="p-3 border-b border-panel-border">
        <h2 className="text-sm font-medium text-foreground">Market Watch</h2>
      </div>
      
      <div className="divide-y divide-panel-border">
        {assets.map((asset) => (
          <div
            key={asset.symbol}
            onClick={() => onAssetSelect(asset.symbol)}
            className={cn(
              "p-3 cursor-pointer transition-colors duration-200 hover:bg-hover",
              selectedAsset === asset.symbol && "bg-active border-l-2 border-l-primary"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">{asset.symbol}</span>
              </div>
              <div className={cn(
                "text-xs font-medium",
                asset.changePercent >= 0 ? "text-profit" : "text-loss"
              )}>
                {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mb-2">{asset.name}</div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">Bid</div>
                <div className="font-mono text-sell">{asset.bid.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Ask</div>
                <div className="font-mono text-buy">{asset.ask.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Change: </span>
              <span className={cn(
                "font-mono",
                asset.change >= 0 ? "text-profit" : "text-loss"
              )}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(asset.symbol === 'BTC' || asset.symbol === 'USTEC' ? 2 : 5)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AssetList;