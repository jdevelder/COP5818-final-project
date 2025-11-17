import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatEther } from 'viem';
import { Clock, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';

interface Trade {
  id: string;
  type: 'futures' | 'options' | 'swaps';
  action: 'open' | 'close' | 'exercise' | 'settle';
  cardId: string;
  positionType?: 'LONG' | 'SHORT' | 'CALL' | 'PUT';
  price: number;
  quantity: number;
  pnl: number;
  timestamp: number;
  txHash: string;
}

// Mock data
const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    type: 'futures',
    action: 'close',
    cardId: 'Charizard-BaseSet-Rare',
    positionType: 'LONG',
    price: 12,
    quantity: 1,
    pnl: 2,
    timestamp: Date.now() - 3600000,
    txHash: '0xabc...def',
  },
  {
    id: '2',
    type: 'options',
    action: 'exercise',
    cardId: 'BlackLotus-Alpha-Mythic',
    positionType: 'CALL',
    price: 105000,
    quantity: 1,
    pnl: 5000,
    timestamp: Date.now() - 7200000,
    txHash: '0x123...456',
  },
  {
    id: '3',
    type: 'swaps',
    action: 'settle',
    cardId: 'PikachuEX-XY-Rare',
    price: 5.5,
    quantity: 2,
    pnl: -0.5,
    timestamp: Date.now() - 10800000,
    txHash: '0x789...012',
  },
];

export default function TradingHistory() {
  const [filter, setFilter] = useState<'all' | 'futures' | 'options' | 'swaps'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'pnl'>('date');

  const filteredTrades = MOCK_TRADES.filter(
    trade => filter === 'all' || trade.type === filter
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'futures':
        return 'bg-blue-500/20 text-blue-400';
      case 'options':
        return 'bg-purple-500/20 text-purple-400';
      case 'swaps':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Trading History
        </h2>

        <div className="flex gap-2">
          {/* Filter */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {['all', 'futures', 'options', 'swaps'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition ${
                  filter === f
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Export */}
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold transition flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Trade List */}
      <div className="space-y-3">
        {filteredTrades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left: Trade Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTypeColor(trade.type)}`}>
                    {trade.type.toUpperCase()}
                  </span>
                  {trade.positionType && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      trade.positionType === 'LONG' || trade.positionType === 'CALL'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.positionType}
                    </span>
                  )}
                  <span className="text-gray-400 text-xs">{trade.action.toUpperCase()}</span>
                </div>

                <h4 className="text-white font-semibold mb-1">{trade.cardId}</h4>

                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span>Price: ${trade.price}</span>
                  <span>Qty: {trade.quantity}</span>
                  <span>{formatTime(trade.timestamp)}</span>
                </div>
              </div>

              {/* Right: P&L */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2">
                <div className="flex items-center gap-1">
                  {trade.pnl >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-2xl font-bold ${
                    trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                </div>

                <a
                  href={`https://etherscan.io/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 transition font-mono"
                >
                  {trade.txHash}
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTrades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No trades found</p>
        </div>
      )}
    </div>
  );
}
