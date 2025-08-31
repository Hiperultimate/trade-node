import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TradingPanelProps {
  selectedAsset: string;
  currentPrice: number;
}

const TradingPanel = ({ selectedAsset, currentPrice }: TradingPanelProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const handleBuy = () => {
    console.log('Buy order:', { selectedAsset, quantity, price, takeProfit, stopLoss, type: 'buy' });
  };

  const handleSell = () => {
    console.log('Sell order:', { selectedAsset, quantity, price, takeProfit, stopLoss, type: 'sell' });
  };

  return (
    <Card className="w-80 bg-panel-bg border-panel-border h-full">
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-sm font-medium text-foreground mb-2">Order Panel</h2>
        <div className="text-lg font-mono text-foreground">
          {selectedAsset}: {currentPrice.toLocaleString(undefined, {
            minimumFractionDigits: selectedAsset === 'BTC' ? 2 : 5,
            maximumFractionDigits: selectedAsset === 'BTC' ? 2 : 5
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
            <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
          </TabsList>
          
          <TabsContent value="market" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-xs text-muted-foreground">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="limit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs text-muted-foreground">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder={currentPrice.toString()}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity-limit" className="text-xs text-muted-foreground">Quantity</Label>
              <Input
                id="quantity-limit"
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="take-profit" className="text-xs text-muted-foreground">Take Profit</Label>
            <Input
              id="take-profit"
              type="number"
              placeholder="Optional"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop-loss" className="text-xs text-muted-foreground">Stop Loss</Label>
            <Input
              id="stop-loss"
              type="number"
              placeholder="Optional"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            onClick={handleBuy}
            disabled={!quantity}
            className={cn(
              "bg-buy hover:bg-buy/90 text-white font-medium",
              !quantity && "opacity-50 cursor-not-allowed"
            )}
          >
            BUY
          </Button>
          <Button
            onClick={handleSell}
            disabled={!quantity}
            className={cn(
              "bg-sell hover:bg-sell/90 text-white font-medium",
              !quantity && "opacity-50 cursor-not-allowed"
            )}
          >
            SELL
          </Button>
        </div>

      </div>
    </Card>
  );
};

export default TradingPanel;