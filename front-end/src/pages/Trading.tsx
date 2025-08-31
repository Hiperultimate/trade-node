import { useState } from 'react';
import AssetList from '@/components/AssetList';
import TradingChart from '@/components/TradingChart';
import TradingPanel from '@/components/TradingPanel';
import PositionsList from '@/components/PositionsList';
import LoginDialog from '@/components/LoginDialog';
import { Button } from '@/components/ui/button';

interface UserData {
  username: string;
  balance: number;
}

const Trading = () => {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [user, setUser] = useState<UserData | null>(null);

  const handleLogin = (userData: UserData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 bg-panel-bg border-b border-panel-border flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold text-primary">Trade Node</h1>
          <div className="text-sm text-muted-foreground">Professional Trading Platform</div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="text-sm text-foreground">
                <span className="text-muted-foreground">Balance: </span>
                <span className="font-mono text-primary">${user.balance.toLocaleString()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Welcome, {user.username}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-panel-border text-foreground hover:bg-hover"
              >
                Logout
              </Button>
            </>
          ) : (
            <LoginDialog isLoggedIn={false} onLogin={handleLogin}>
              <Button 
                variant="default"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Login
              </Button>
            </LoginDialog>
          )}
        </div>
      </header>

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