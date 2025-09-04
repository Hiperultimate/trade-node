import { useState } from 'react';
import AssetList from '@/components/AssetList';
import TradingChart from '@/components/TradingChart';
import TradingPanel from '@/components/TradingPanel';
import PositionsList from '@/components/PositionsList';
import NavBar from '@/components/NavBar';
import { Card } from '@/components/ui/card';
import useLiveAssetPrices from "@/hooks/use-liveAssetPrice";
import useGetLiveCandleData from '@/hooks/use-getLiveCandleData';


const Trading = () => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // We will connect to WS to fetch latest price list
  useLiveAssetPrices();
  useGetLiveCandleData();

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <NavBar />

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Left Panel - Market Watch */}
        <div className="w-80 flex flex-col">
          <AssetList
            selectedAsset={selectedAsset}
            onAssetSelect={setSelectedAsset}
          />
        </div>

        {/* Center - Chart and Positions */}
        <div className="flex-1 grid grid-rows-[3fr_2fr] gap-4">
          {/* Chart */}
          {selectedAsset ? (
            <div className="h-full">
              <TradingChart selectedAsset={selectedAsset} />
            </div>
          ) : (
            <Card className="bg-panel-bg border-panel-border h-full"></Card>
          )}

          {/* Open Positions */}
          <div className="h-full">
            <PositionsList />
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 flex flex-col">
          <TradingPanel selectedAsset={selectedAsset} />
        </div>
      </div>
    </div>
  );
};

export default Trading;