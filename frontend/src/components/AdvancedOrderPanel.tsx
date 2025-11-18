import React, { useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, Target, Shield, Zap, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export type OrderType = 'market' | 'limit' | 'stop-loss' | 'take-profit' | 'trailing-stop';

interface AdvancedOrderPanelProps {
  currentPrice: string;
  onOrderTypeChange: (type: OrderType) => void;
  onLimitPriceChange: (price: string) => void;
  onStopPriceChange: (price: string) => void;
  onTargetPriceChange: (price: string) => void;
  onTrailingPercentChange: (percent: string) => void;
}

export default function AdvancedOrderPanel({
  currentPrice,
  onOrderTypeChange,
  onLimitPriceChange,
  onStopPriceChange,
  onTargetPriceChange,
  onTrailingPercentChange,
}: AdvancedOrderPanelProps) {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [trailingPercent, setTrailingPercent] = useState('5');

  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    onOrderTypeChange(type);

    // Auto-fill prices based on current price
    const current = parseFloat(currentPrice || '0');
    if (current > 0) {
      switch (type) {
        case 'limit':
          if (!limitPrice) {
            const suggested = (current * 0.95).toFixed(2);
            setLimitPrice(suggested);
            onLimitPriceChange(suggested);
          }
          break;
        case 'stop-loss':
          if (!stopPrice) {
            const suggested = (current * 0.90).toFixed(2);
            setStopPrice(suggested);
            onStopPriceChange(suggested);
          }
          break;
        case 'take-profit':
          if (!targetPrice) {
            const suggested = (current * 1.10).toFixed(2);
            setTargetPrice(suggested);
            onTargetPriceChange(suggested);
          }
          break;
      }
    }
  };

  const orderTypes: { type: OrderType; name: string; icon: any; description: string; color: string }[] = [
    {
      type: 'market',
      name: 'Market Order',
      icon: Zap,
      description: 'Execute immediately at current market price',
      color: 'purple',
    },
    {
      type: 'limit',
      name: 'Limit Order',
      icon: Target,
      description: 'Execute only at your specified price or better',
      color: 'blue',
    },
    {
      type: 'stop-loss',
      name: 'Stop-Loss',
      icon: Shield,
      description: 'Automatically close position to limit losses',
      color: 'red',
    },
    {
      type: 'take-profit',
      name: 'Take-Profit',
      icon: TrendingUp,
      description: 'Automatically close position at target profit',
      color: 'green',
    },
    {
      type: 'trailing-stop',
      name: 'Trailing Stop',
      icon: TrendingDown,
      description: 'Dynamic stop-loss that follows price movements',
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string, selected: boolean) => {
    const colors = {
      purple: selected
        ? 'bg-purple-500 text-white border-purple-500'
        : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-purple-100 dark:hover:bg-purple-500/20',
      blue: selected
        ? 'bg-blue-500 text-white border-blue-500'
        : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-blue-100 dark:hover:bg-blue-500/20',
      red: selected
        ? 'bg-red-500 text-white border-red-500'
        : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-500/20',
      green: selected
        ? 'bg-green-500 text-white border-green-500'
        : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-green-100 dark:hover:bg-green-500/20',
      orange: selected
        ? 'bg-orange-500 text-white border-orange-500'
        : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-white/10 hover:bg-orange-100 dark:hover:bg-orange-500/20',
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="space-y-4">
      {/* Order Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Order Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {orderTypes.map((type) => {
            const Icon = type.icon;
            const selected = orderType === type.type;

            return (
              <motion.button
                key={type.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOrderTypeChange(type.type)}
                className={`p-4 rounded-xl border-2 transition text-left ${getColorClasses(
                  type.color,
                  selected
                )}`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <p className="font-bold text-sm mb-1">{type.name}</p>
                <p className={`text-xs ${selected ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                  {type.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Order-Specific Fields */}
      {orderType === 'market' && (
        <div className="p-4 bg-purple-100 dark:bg-purple-500/10 rounded-xl border border-purple-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-purple-900 dark:text-purple-400 mb-1">Market Order</p>
              <p className="text-purple-800 dark:text-purple-300">
                Your order will execute immediately at the current market price (~${currentPrice}). This guarantees
                execution but not price.
              </p>
            </div>
          </div>
        </div>
      )}

      {orderType === 'limit' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Limit Price (USD)
            </label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => {
                setLimitPrice(e.target.value);
                onLimitPriceChange(e.target.value);
              }}
              placeholder="Enter limit price"
              className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Current price: ${currentPrice} • Your order will execute at ${limitPrice || '0'} or better
            </p>
          </div>
          <div className="p-4 bg-blue-100 dark:bg-blue-500/10 rounded-xl border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Limit orders only execute at your specified price or better. This gives you price control but doesn't
                guarantee execution.
              </p>
            </div>
          </div>
        </div>
      )}

      {orderType === 'stop-loss' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Stop Price (USD)
            </label>
            <input
              type="number"
              value={stopPrice}
              onChange={(e) => {
                setStopPrice(e.target.value);
                onStopPriceChange(e.target.value);
              }}
              placeholder="Enter stop price"
              className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Current price: ${currentPrice} •{' '}
              {parseFloat(stopPrice) < parseFloat(currentPrice)
                ? `Triggers when price falls to $${stopPrice}`
                : 'Warning: Stop price should be below current price for long positions'}
            </p>
          </div>
          <div className="p-4 bg-red-100 dark:bg-red-500/10 rounded-xl border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Stop-loss orders automatically close your position when the price reaches your stop level, helping to
                limit potential losses.
              </p>
            </div>
          </div>
        </div>
      )}

      {orderType === 'take-profit' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Target Price (USD)
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => {
                setTargetPrice(e.target.value);
                onTargetPriceChange(e.target.value);
              }}
              placeholder="Enter target price"
              className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Current price: ${currentPrice} •{' '}
              {parseFloat(targetPrice) > parseFloat(currentPrice)
                ? `Triggers when price reaches $${targetPrice}`
                : 'Warning: Target price should be above current price for long positions'}
            </p>
          </div>
          <div className="p-4 bg-green-100 dark:bg-green-500/10 rounded-xl border border-green-500/30">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Take-profit orders automatically close your position at your target price, securing profits when your
                goal is reached.
              </p>
            </div>
          </div>
        </div>
      )}

      {orderType === 'trailing-stop' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Trailing Distance (%)
            </label>
            <input
              type="number"
              value={trailingPercent}
              onChange={(e) => {
                setTrailingPercent(e.target.value);
                onTrailingPercentChange(e.target.value);
              }}
              placeholder="Enter trailing percentage"
              min="1"
              max="50"
              className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Stop price will follow market price by {trailingPercent}%. Current trailing stop: $
              {(parseFloat(currentPrice) * (1 - parseFloat(trailingPercent) / 100)).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-orange-100 dark:bg-orange-500/10 rounded-xl border border-orange-500/30">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800 dark:text-orange-300">
                Trailing stops follow the market price at your specified distance. If price moves favorably, the stop
                moves with it. If price reverses, your position closes at the trailing stop level.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
