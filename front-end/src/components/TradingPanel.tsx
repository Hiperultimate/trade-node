import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAssetPriceList } from '@/store/assetPriceList';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserSession } from '@/store/userData';
import { useToast } from "@/hooks/use-toast";

import axios, { AxiosError } from "axios";
import { Slider } from '@/components/ui/slider';

interface TradingPanelProps {
  selectedAsset: string | null;
}

const TradingPanel = ({ selectedAsset }: TradingPanelProps) => {
  const { toast } = useToast();
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [leverage, setLeverage] = useState(1);
  const queryClient = useQueryClient();

  const user = useUserSession(s => s.user);
  const currentAssetPrice = useAssetPriceList(s => s.assetList[selectedAsset]);
  const currentPrice = currentAssetPrice ? currentAssetPrice.askPrice : null;

  const { mutate: invokeTrade, isPending: loading } = useMutation({
    mutationFn: async (type : "buy" | "sell") => { 
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/order/open`,
        {
          type: type,
          qty: quantity,
          asset: selectedAsset,
          stopLoss: stopLoss,
          takeProfit: takeProfit,
          username: user.username,
          leverage: leverage, // Add a slider for leverage
        },
        {
          headers: {
            "auth_token": user.auth_token,
          },
        }
      );

      queryClient.invalidateQueries({queryKey: ["positions"]});

      return response;
    },
    onSuccess: () => { 
      toast({
        title: "Order Placed",
        description: `Your order has been placed succesfully`,
      });
    },
    onError: (e : AxiosError<{ message: string }>) => { 
      toast({
        title: "Error",
        description: e.response.data.message,
        variant: "destructive",
      });
    }
  });

  const handleBuy = () => {
    console.log('Buy order:', { selectedAsset, quantity, price, takeProfit, stopLoss, type: 'buy' });
    invokeTrade("buy");
  };

  const handleSell = () => {
    console.log('Sell order:', { selectedAsset, quantity, price, takeProfit, stopLoss, type: 'sell' });
    invokeTrade("sell");
  };

  return (
    <Card className="w-80 bg-panel-bg border-panel-border h-full">
      <div className="p-4 border-b border-panel-border">
        <h2 className="text-sm font-medium text-foreground mb-2">
          Order Panel
        </h2>
        {selectedAsset && (
          <div className="text-lg font-mono text-foreground">
            {selectedAsset}:{" "}
            {currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: selectedAsset === "BTC" ? 2 : 5,
              maximumFractionDigits: selectedAsset === "BTC" ? 2 : 5,
            })}
          </div>
        )}
      </div>

      {selectedAsset && user && (
        <div className="p-4 space-y-4">
          <Tabs
            value={orderType}
            onValueChange={(value) => setOrderType(value as "market" | "limit")}
          >
            {/* <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="market" className="text-xs">
                Market
              </TabsTrigger>
              <TabsTrigger value="limit" className="text-xs">
                Limit
              </TabsTrigger>
            </TabsList> */}
            <TabsList className="w-full bg-muted">
              <TabsTrigger value="market" className="w-full text-xs">
                Market
              </TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label
                  htmlFor="quantity"
                  className="text-xs text-muted-foreground"
                >
                  Quantity
                </Label>
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

            {/* <TabsContent value="limit" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-xs text-muted-foreground"
                >
                  Price
                </Label>
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
                <Label
                  htmlFor="quantity-limit"
                  className="text-xs text-muted-foreground"
                >
                  Quantity
                </Label>
                <Input
                  id="quantity-limit"
                  type="number"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </TabsContent> */}
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="take-profit"
                className="text-xs text-muted-foreground"
              >
                Take Profit
              </Label>
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
              <Label
                htmlFor="stop-loss"
                className="text-xs text-muted-foreground"
              >
                Stop Loss
              </Label>
              <Input
                id="stop-loss"
                type="number"
                placeholder="Optional"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="stop-loss"
                className="text-xs text-muted-foreground"
              >
                Leverage
              </Label>
              <Slider
                min={1}
                max={100}
                step={1}
                value={[leverage]}
                onValueChange={(val) => setLeverage(val[0])}
              />
              <div className="flex justify-center">

              <div className="text-2xl font-semibold tabular-nums">
                {leverage}x
              </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              onClick={handleBuy}
              disabled={!quantity || loading}
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
      )}
    </Card>
  );
};

export default TradingPanel;