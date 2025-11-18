import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react';

interface Order {
  id: string;
  type: 'buy' | 'sell';
  cardName: string;
  price: number;
  quantity: number;
  total: number;
  timestamp: number;
}

interface Match {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  cardName: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export default function OrderBook() {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [newMatchId, setNewMatchId] = useState<string | null>(null);

  const cardNames = [
    'Charizard Base Set',
    'Black Lotus Alpha',
    'Pikachu Illustrator',
    'Mox Sapphire',
    'Blastoise Base Set',
    'Time Walk',
  ];

  const getRandomCard = () => cardNames[Math.floor(Math.random() * cardNames.length)];

  // Initialize with mock orders
  useEffect(() => {
    const mockBuyOrders: Order[] = [
      { id: '1', type: 'buy', cardName: 'Charizard Base Set', price: 95.50, quantity: 10, total: 955, timestamp: Date.now() - 5000 },
      { id: '2', type: 'buy', cardName: 'Black Lotus Alpha', price: 95.00, quantity: 15, total: 1425, timestamp: Date.now() - 4000 },
      { id: '3', type: 'buy', cardName: 'Pikachu Illustrator', price: 94.50, quantity: 20, total: 1890, timestamp: Date.now() - 3000 },
      { id: '4', type: 'buy', cardName: 'Mox Sapphire', price: 94.00, quantity: 12, total: 1128, timestamp: Date.now() - 2000 },
      { id: '5', type: 'buy', cardName: 'Blastoise Base Set', price: 93.50, quantity: 8, total: 748, timestamp: Date.now() - 1000 },
    ];

    const mockSellOrders: Order[] = [
      { id: '6', type: 'sell', cardName: 'Charizard Base Set', price: 96.00, quantity: 8, total: 768, timestamp: Date.now() - 5000 },
      { id: '7', type: 'sell', cardName: 'Black Lotus Alpha', price: 96.50, quantity: 12, total: 1158, timestamp: Date.now() - 4000 },
      { id: '8', type: 'sell', cardName: 'Pikachu Illustrator', price: 97.00, quantity: 15, total: 1455, timestamp: Date.now() - 3000 },
      { id: '9', type: 'sell', cardName: 'Time Walk', price: 97.50, quantity: 10, total: 975, timestamp: Date.now() - 2000 },
      { id: '10', type: 'sell', cardName: 'Mox Sapphire', price: 98.00, quantity: 20, total: 1960, timestamp: Date.now() - 1000 },
    ];

    setBuyOrders(mockBuyOrders.sort((a, b) => b.price - a.price));
    setSellOrders(mockSellOrders.sort((a, b) => a.price - b.price));

    // Simulate order matching every 5 seconds
    const matchInterval = setInterval(() => {
      simulateMatch();
    }, 5000);

    return () => clearInterval(matchInterval);
  }, []);

  const simulateMatch = () => {
    // Simulate new orders being added randomly
    const shouldAddBuy = Math.random() > 0.5;
    const newPrice = shouldAddBuy ? 95 + Math.random() * 2 : 96 + Math.random() * 2;
    const newQuantity = Math.floor(Math.random() * 15) + 5;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      type: shouldAddBuy ? 'buy' : 'sell',
      cardName: getRandomCard(),
      price: parseFloat(newPrice.toFixed(2)),
      quantity: newQuantity,
      total: parseFloat((newPrice * newQuantity).toFixed(2)),
      timestamp: Date.now(),
    };

    if (shouldAddBuy) {
      setBuyOrders(prev => [newOrder, ...prev].slice(0, 10).sort((a, b) => b.price - a.price));

      // Check if buy order can match with sell orders
      setSellOrders(prevSell => {
        const matchableSell = prevSell.find(sell => sell.price <= newOrder.price);
        if (matchableSell) {
          const match: Match = {
            id: `match_${Date.now()}`,
            buyOrderId: newOrder.id,
            sellOrderId: matchableSell.id,
            cardName: matchableSell.cardName,
            price: matchableSell.price,
            quantity: Math.min(newOrder.quantity, matchableSell.quantity),
            timestamp: Date.now(),
          };

          setRecentMatches(prev => [match, ...prev].slice(0, 10));
          setNewMatchId(match.id);
          setTimeout(() => setNewMatchId(null), 2000);

          return prevSell.filter(order => order.id !== matchableSell.id);
        }
        return prevSell;
      });
    } else {
      setSellOrders(prev => [newOrder, ...prev].slice(0, 10).sort((a, b) => a.price - b.price));

      // Check if sell order can match with buy orders
      setBuyOrders(prevBuy => {
        const matchableBuy = prevBuy.find(buy => buy.price >= newOrder.price);
        if (matchableBuy) {
          const match: Match = {
            id: `match_${Date.now()}`,
            buyOrderId: matchableBuy.id,
            sellOrderId: newOrder.id,
            cardName: newOrder.cardName,
            price: newOrder.price,
            quantity: Math.min(newOrder.quantity, matchableBuy.quantity),
            timestamp: Date.now(),
          };

          setRecentMatches(prev => [match, ...prev].slice(0, 10));
          setNewMatchId(match.id);
          setTimeout(() => setNewMatchId(null), 2000);

          return prevBuy.filter(order => order.id !== matchableBuy.id);
        }
        return prevBuy;
      });
    }
  };

  const spread = sellOrders.length > 0 && buyOrders.length > 0
    ? (sellOrders[0].price - buyOrders[0].price).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Order Book Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Book</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Live order matching engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg">
          <Activity className="w-5 h-5 text-green-500" />
          <span className="text-gray-900 dark:text-white font-semibold">Spread: ${spread}</span>
        </div>
      </div>

      {/* Order Book Table */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Buy Orders */}
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Buy Orders</h3>
          </div>

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-white/10 pb-2">
              <div>Card</div>
              <div>Price</div>
              <div>Qty</div>
              <div className="text-right">Total</div>
            </div>

            {/* Buy Order List */}
            <AnimatePresence>
              {buyOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-4 gap-2 text-sm p-2 rounded-lg hover:bg-green-500/10 transition"
                >
                  <div className="text-gray-900 dark:text-white font-medium truncate">{order.cardName}</div>
                  <div className="text-green-600 dark:text-green-400 font-semibold">${order.price.toFixed(2)}</div>
                  <div className="text-gray-900 dark:text-white">{order.quantity}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-right">${order.total.toFixed(2)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sell Orders */}
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sell Orders</h3>
          </div>

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-white/10 pb-2">
              <div>Card</div>
              <div>Price</div>
              <div>Qty</div>
              <div className="text-right">Total</div>
            </div>

            {/* Sell Order List */}
            <AnimatePresence>
              {sellOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-4 gap-2 text-sm p-2 rounded-lg hover:bg-red-500/10 transition"
                >
                  <div className="text-gray-900 dark:text-white font-medium truncate">{order.cardName}</div>
                  <div className="text-red-600 dark:text-red-400 font-semibold">${order.price.toFixed(2)}</div>
                  <div className="text-gray-900 dark:text-white">{order.quantity}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-right">${order.total.toFixed(2)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Matches</h3>
        </div>

        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 border-b border-gray-300 dark:border-white/10 pb-2">
            <div>Card</div>
            <div>Price</div>
            <div>Qty</div>
            <div>Total</div>
            <div className="text-right">Time</div>
          </div>

          {/* Match List */}
          <AnimatePresence>
            {recentMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.95, backgroundColor: 'rgba(234, 179, 8, 0.2)' }}
                animate={{ opacity: 1, scale: 1, backgroundColor: 'rgba(0, 0, 0, 0)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`grid grid-cols-5 gap-2 text-sm p-2 rounded-lg ${
                  newMatchId === match.id ? 'bg-yellow-500/20' : ''
                }`}
              >
                <div className="text-gray-900 dark:text-white font-medium truncate">{match.cardName}</div>
                <div className="text-purple-600 dark:text-purple-400 font-semibold">${match.price.toFixed(2)}</div>
                <div className="text-gray-900 dark:text-white">{match.quantity}</div>
                <div className="text-gray-900 dark:text-white">${(match.price * match.quantity).toFixed(2)}</div>
                <div className="text-gray-600 dark:text-gray-400 text-right text-xs">
                  {new Date(match.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {recentMatches.length === 0 && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No matches yet. Orders will be matched automatically when prices align.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
