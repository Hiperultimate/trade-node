import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAssetPriceList } from '@/store/assetPriceList';

export interface Asset {
  symbol: string;
  bid: number;
  ask: number;
}

interface AssetListProps {
  selectedAsset: string;
  onAssetSelect: (symbol: string) => void;
}

const AssetList = ({ selectedAsset, onAssetSelect }: AssetListProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);

  const assetList = useAssetPriceList((s) => s.assetList); // Already updaing real time

  useEffect(() => { 
    if (!assetList || typeof assetList !== "object") return;

    setAssets((prev) => {
      // preserve order of existing items
      const bySymbol = new Map<string, Asset>();
      for (const a of prev) bySymbol.set(a.symbol, { ...a });

      // override/add from assetList
      for (const [symbol, quote] of Object.entries(assetList)) {
        // convert to numbers 
        const bid = Number((quote).bidPrice);
        const ask = Number((quote).askPrice);

        // set/replace
        bySymbol.set(symbol, { symbol, bid, ask });
      }

      // return array preserving previous order, with new symbols appended
      return Array.from(bySymbol.values());
    });

  },[assetList])

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
            </div>
            
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
          </div>
        ))}
      </div>
    </Card>
  );
};

export default AssetList;