import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';

export default function LivePriceTicker() {
  const { prices, subscribe, isConnected } = useWebSocket();

  // Subscribe to all cards on mount
  useEffect(() => {
    const cardIds = [
      'Charizard-BaseSet-Rare',
      'BlackLotus-Alpha-Mythic',
      'PikachuEX-XY-Rare',
      'TimeWalk-Alpha-Rare',
      'Blastoise-BaseSet-Rare',
      'Venusaur-BaseSet-Rare',
    ];

    cardIds.forEach(id => subscribe(id));
  }, [subscribe]);

  const priceArray = Array.from(prices.values());

  return (
    <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-300 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Live Prices</h3>
          {isConnected && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Price Ticker */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 p-4 min-w-max">
          {priceArray.map((priceUpdate) => (
            <div
              key={priceUpdate.cardId}
              className="flex-shrink-0 bg-gray-100 dark:bg-white/5 rounded-lg p-3 min-w-[180px]"
            >
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                {priceUpdate.cardId.replace(/-/g, ' ')}
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${priceUpdate.price.toFixed(2)}
                </div>
                <div className={`flex items-center text-xs font-semibold ${
                  priceUpdate.change24h >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {priceUpdate.change24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(priceUpdate.change24h).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
