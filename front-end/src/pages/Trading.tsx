import { useState } from 'react';
import AssetList from '@/components/AssetList';
import TradingChart from '@/components/TradingChart';
import TradingPanel from '@/components/TradingPanel';
import PositionsList from '@/components/PositionsList';
import NavBar from '@/components/NavBar';

const Trading = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <NavBar/>

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
        <div className="flex-1 flex flex-col gap-4">
          {/* Chart */}
          <div className="flex-1">
            <TradingChart selectedAsset={selectedAsset} />
          </div>
          
          {/* Open Positions */}
          <div className="h-48">
            <PositionsList />
          </div>
        </div>

        {/* Right Panel - Trading */}
        <div className="w-80 flex flex-col">
          <TradingPanel 
            selectedAsset={selectedAsset}
            currentPrice={108782.41} // This would come from real data
          />
        </div>
      </div>
    </div>
  );
};

export default Trading;