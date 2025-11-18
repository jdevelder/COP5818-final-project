import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { TrendingUp, Shield, Zap, ArrowRight, Calculator, History, DollarSign, BarChart3, Trophy, Droplet, Vote, MessageSquare, Target } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import LivePriceTicker from '@/components/LivePriceTicker';
import AITradingAssistant from '@/components/AITradingAssistant';

export default function Home() {
  return (
    <>
      <Head>
        <title>TCG Derivatives Trading Platform</title>
      </Head>

      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">TCG Derivatives</span>
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <ThemeToggle />
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6 animate-float">
              Trade TCG Card Derivatives
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Hedge Risk, Maximize Returns
              </span>
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              The first decentralized platform for Trading Card Game derivatives.
              Trade futures, options, and swaps while maintaining card ownership.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {/* Row 1: 5 buttons - Primary Actions */}
              <Link href="/trade">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  Start Trading
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/analytics">
                <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics
                </button>
              </Link>
              <Link href="/liquidity">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <Droplet className="w-5 h-5" />
                  Liquidity
                </button>
              </Link>
              <Link href="/risk-survey">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Risk Survey
                </button>
              </Link>
              <Link href="/card-prices">
                <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-lime-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Prices
                </button>
              </Link>

              {/* Row 2: 3 buttons - Secondary Features */}
              <div className="w-full h-0"></div>
              <Link href="/leaderboard">
                <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Leaderboard
                </button>
              </Link>
              <Link href="/risk-calculator">
                <button className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Risk Calculator
                </button>
              </Link>
              <Link href="/transaction-history">
                <button className="px-8 py-4 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <History className="w-5 h-5" />
                  History
                </button>
              </Link>

              {/* Row 3: 2 buttons - Community */}
              <div className="w-full h-0"></div>
              <Link href="/governance">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <Vote className="w-5 h-5" />
                  Governance
                </button>
              </Link>
              <Link href="/forum">
                <button className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Forum
                </button>
              </Link>

              {/* Row 4: 1 button - Education */}
              <div className="w-full h-0"></div>
              <Link href="/learn">
                <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Futures Card */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-white/10 transition group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Futures</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Lock in prices for future transactions. Go long or short on card values with leveraged positions.
              </p>
              <Link href="/trade/futures">
                <button className="text-blue-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Trade Futures
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Options Card */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-white/10 transition group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Options</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Buy the right to trade at specific prices. Limit downside risk while maintaining upside potential.
              </p>
              <Link href="/trade/options">
                <button className="text-purple-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Trade Options
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Swaps Card */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8 hover:bg-white/90 dark:hover:bg-white/10 transition group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Swaps</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Exchange cash flows based on card price movements. Perfect for hedging portfolio risk.
              </p>
              <Link href="/trade/swaps">
                <button className="text-green-400 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                  Trade Swaps
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-500/20 dark:to-pink-500/20 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$2.5M+</div>
                <div className="text-gray-700 dark:text-gray-300">Total Volume</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">1,234</div>
                <div className="text-gray-700 dark:text-gray-300">Active Traders</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">567</div>
                <div className="text-gray-700 dark:text-gray-300">Open Positions</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">99.9%</div>
                <div className="text-gray-700 dark:text-gray-300">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>2024 TCG Derivatives Trading Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* AI Trading Assistant - Floating Widget */}
        <AITradingAssistant />
      </div>
    </>
  );
}
