import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Award, Users } from 'lucide-react';
import { calculateLevel } from '@/data/achievements';

interface LeaderboardEntry {
  rank: number;
  address: string;
  username?: string;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  xp: number;
  level: number;
}

// Mock leaderboard data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, address: '0x1234...5678', username: 'CardMaster', totalPnL: 50000, winRate: 85, totalTrades: 150, xp: 15000, level: 12 },
  { rank: 2, address: '0x2345...6789', username: 'CryptoKing', totalPnL: 45000, winRate: 82, totalTrades: 140, xp: 14000, level: 11 },
  { rank: 3, address: '0x3456...7890', username: 'TCGPro', totalPnL: 40000, winRate: 80, totalTrades: 130, xp: 13000, level: 11 },
  { rank: 4, address: '0x4567...8901', username: 'TradeGod', totalPnL: 35000, winRate: 78, totalTrades: 120, xp: 12000, level: 10 },
  { rank: 5, address: '0x5678...9012', username: 'DeFiWhale', totalPnL: 30000, winRate: 75, totalTrades: 110, xp: 11000, level: 10 },
  { rank: 6, address: '0x6789...0123', totalPnL: 25000, winRate: 73, totalTrades: 100, xp: 10000, level: 10 },
  { rank: 7, address: '0x7890...1234', totalPnL: 20000, winRate: 70, totalTrades: 90, xp: 9000, level: 9 },
  { rank: 8, address: '0x8901...2345', totalPnL: 15000, winRate: 68, totalTrades: 80, xp: 8000, level: 8 },
  { rank: 9, address: '0x9012...3456', totalPnL: 10000, winRate: 65, totalTrades: 70, xp: 7000, level: 8 },
  { rank: 10, address: '0x0123...4567', totalPnL: 5000, winRate: 60, totalTrades: 60, xp: 6000, level: 7 },
];

type SortBy = 'pnl' | 'winRate' | 'trades' | 'level';

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortBy>('pnl');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('allTime');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700';
      default:
        return 'bg-white/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
            <p className="text-gray-400 text-sm">Top traders on the platform</p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly', 'allTime'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                timeframe === tf
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tf === 'allTime' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSortBy('pnl')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'pnl' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Total P&L
        </button>
        <button
          onClick={() => setSortBy('winRate')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'winRate' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Award className="w-4 h-4 inline mr-2" />
          Win Rate
        </button>
        <button
          onClick={() => setSortBy('trades')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'trades' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Total Trades
        </button>
        <button
          onClick={() => setSortBy('level')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            sortBy === 'level' ? 'bg-yellow-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Level
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {MOCK_LEADERBOARD.map((entry, index) => (
          <motion.div
            key={entry.address}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/10 transition group ${
              entry.rank <= 3 ? 'shadow-lg' : ''
            }`}
          >
            {/* Top 3 Glow Effect */}
            {entry.rank <= 3 && (
              <div className="absolute inset-0 rounded-xl opacity-20 blur-xl" style={{
                background: entry.rank === 1 ? '#fbbf24' : entry.rank === 2 ? '#d1d5db' : '#d97706'
              }}></div>
            )}

            <div className="relative flex items-center gap-4">
              {/* Rank Badge */}
              <div className={`flex-shrink-0 w-16 h-16 rounded-lg ${getRankBadgeColor(entry.rank)} flex items-center justify-center`}>
                {getRankIcon(entry.rank)}
              </div>

              {/* Trader Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-bold truncate">
                    {entry.username || entry.address}
                  </p>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-bold">
                    Lv.{entry.level}
                  </span>
                </div>
                {entry.username && (
                  <p className="text-gray-400 text-sm font-mono truncate">{entry.address}</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="hidden md:grid grid-cols-3 gap-6 text-sm">
                <div className="text-right">
                  <p className="text-gray-400">P&L</p>
                  <p className={`font-bold ${entry.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${entry.totalPnL.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Win Rate</p>
                  <p className="text-white font-bold">{entry.winRate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Trades</p>
                  <p className="text-white font-bold">{entry.totalTrades}</p>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="md:hidden text-right">
                <p className={`text-lg font-bold ${entry.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${entry.totalPnL.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">{entry.winRate}% • {entry.totalTrades} trades</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Your Rank (if logged in) */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-purple-500/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Your Rank</p>
            <p className="text-2xl font-bold text-white">#42</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition">
            Climb the Ranks
          </button>
        </div>
      </div>
    </div>
  );
}
