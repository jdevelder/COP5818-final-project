import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Activity,
  Target,
  Flame,
  Shield,
  BarChart3,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import MobileNav from '@/components/MobileNav';

// Mock user data - in production, fetch from blockchain/backend
const getMockUserData = (address: string) => ({
  address,
  username: 'CardMaster',
  level: 12,
  xp: 15000,
  nextLevelXp: 18000,
  rank: 1,
  joinedDate: '2024-01-15',
  bio: 'Professional TCG trader specializing in futures and options strategies. Top 10 trader for 6 consecutive months.',
  stats: {
    totalPnL: 50000,
    winRate: 85,
    totalTrades: 150,
    avgProfit: 450,
    avgLoss: -180,
    profitFactor: 2.5,
    totalVolume: 250000,
    activePositions: 5,
    completedTrades: 145,
    roi: 35.2,
  },
  badges: [
    { id: 'legend', name: 'Trading Legend', icon: '👑', rarity: 'legendary' },
    { id: 'whale', name: 'Whale Trader', icon: '🐋', rarity: 'epic' },
    { id: 'streak', name: 'Win Streak Master', icon: '🔥', rarity: 'rare' },
    { id: 'early', name: 'Early Adopter', icon: '🚀', rarity: 'common' },
  ],
  recentTrades: [
    { card: 'Charizard Base Set', type: 'Future', pnl: 1250, date: '2024-06-15', status: 'closed' },
    { card: 'Black Lotus Alpha', type: 'Option', pnl: -320, date: '2024-06-14', status: 'closed' },
    { card: 'Pikachu Illustrator', type: 'Swap', pnl: 890, date: '2024-06-13', status: 'active' },
    { card: 'Mox Sapphire', type: 'Future', pnl: 2100, date: '2024-06-12', status: 'closed' },
  ],
  favoriteCards: ['Charizard', 'Black Lotus', 'Pikachu', 'Mox Sapphire'],
});

export default function UserProfile() {
  const router = useRouter();
  const { address } = router.query;
  const [copied, setCopied] = useState(false);

  if (!address || typeof address !== 'string') {
    return <div>Loading...</div>;
  }

  const userData = getMockUserData(address);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const xpProgress = (userData.xp / userData.nextLevelXp) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-500 to-orange-500';
      case 'epic':
        return 'from-purple-500 to-pink-500';
      case 'rare':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <>
      <Head>
        <title>{userData.username} - Profile | TCG Derivatives</title>
      </Head>

      <div className="min-h-screen pb-24 lg:pb-8">
        <MobileNav />

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/leaderboard">
                <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                  <span className="text-gray-900 dark:text-white font-semibold">Back to Leaderboard</span>
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-4xl">
                    {userData.username[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-yellow-500 rounded-full text-white font-bold text-sm flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    #{userData.rank}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userData.username}</h1>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-bold">
                      Level {userData.level}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">{address}</p>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* XP Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {userData.xp.toLocaleString()} / {userData.nextLevelXp.toLocaleString()} XP
                      </span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">
                        {xpProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{userData.bio}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(userData.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total P&L</p>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${userData.stats.totalPnL.toLocaleString()}
                </p>
              </div>

              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Win Rate</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.stats.winRate}%
                </p>
              </div>

              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total Trades</p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData.stats.totalTrades}
                </p>
              </div>

              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">ROI</p>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userData.stats.roi}%
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Badges & Achievements
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {userData.badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-gradient-to-br ${getRarityColor(badge.rarity)} p-4 rounded-xl text-center`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="text-white font-bold text-sm">{badge.name}</p>
                    <p className="text-white/80 text-xs capitalize">{badge.rarity}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Recent Trades
              </h2>
              <div className="space-y-3">
                {userData.recentTrades.map((trade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-100 dark:bg-white/5 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">{trade.card}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {trade.type} • {new Date(trade.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          trade.pnl >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{trade.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
