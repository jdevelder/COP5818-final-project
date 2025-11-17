import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Percent,
  Clock,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import WalletButton from '@/components/WalletButton';
import { useFutures } from '@/hooks/useFutures';
import { useOptions } from '@/hooks/useOptions';
import { useSwaps } from '@/hooks/useSwaps';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const { address, isConnected } = useAccount();
  const { getUserPositions: getFutures, getPosition: getFuturesDetails } = useFutures();
  const { getBuyerOptions, getOption } = useOptions();
  const { getUserSwaps, getSwap } = useSwaps();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    avgHoldTime: 0,
    bestTrade: 0,
    worstTrade: 0,
    totalCollateral: 0,
    activePositions: 0,
  });

  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [pnlHistory, setPnlHistory] = useState<any[]>([]);
  const [positionBreakdown, setPositionBreakdown] = useState<any[]>([]);
  const [performanceByType, setPerformanceByType] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && address) {
      loadAnalytics();
    }
  }, [isConnected, address]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      // Load all positions
      const futuresIds = await getFutures(address!);
      const optionsIds = await getBuyerOptions(address!);
      const swapsIds = await getUserSwaps(address!);

      const futuresPositions = await Promise.all(
        futuresIds.map(id => getFuturesDetails(Number(id)))
      );
      const optionsPositions = await Promise.all(
        optionsIds.map(id => getOption(Number(id)))
      );
      const swapsPositions = await Promise.all(
        swapsIds.map(id => getSwap(Number(id)))
      );

      // Calculate analytics
      let totalPnL = 0;
      let wins = 0;
      let losses = 0;
      let totalCollateral = 0;
      let activeCount = 0;
      const pnlValues: number[] = [];

      // Process futures
      futuresPositions.forEach(pos => {
        if (pos) {
          const pnl = parseFloat(formatEther(pos.currentPnL));
          totalPnL += pnl;
          pnlValues.push(pnl);
          if (pnl > 0) wins++;
          if (pnl < 0) losses++;
          totalCollateral += parseFloat(formatEther(pos.collateral));
          if (pos.status === 0) activeCount++;
        }
      });

      // Process options
      optionsPositions.forEach(opt => {
        if (opt && opt.status === 0) activeCount++;
      });

      // Process swaps
      swapsPositions.forEach(swap => {
        if (swap) {
          const pnl = parseFloat(formatEther(swap.currentPnLA));
          totalPnL += pnl;
          pnlValues.push(pnl);
          if (pnl > 0) wins++;
          if (pnl < 0) losses++;
          if (swap.status === 1) activeCount++;
        }
      });

      const totalTrades = wins + losses;
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

      setAnalytics({
        totalPnL,
        winRate,
        totalTrades,
        avgHoldTime: 7, // Mock data
        bestTrade: pnlValues.length > 0 ? Math.max(...pnlValues) : 0,
        worstTrade: pnlValues.length > 0 ? Math.min(...pnlValues) : 0,
        totalCollateral,
        activePositions: activeCount,
      });

      // Generate portfolio data (mock for now)
      setPortfolioData([
        { date: '2024-01', value: 1000 },
        { date: '2024-02', value: 1200 },
        { date: '2024-03', value: 1150 },
        { date: '2024-04', value: 1400 },
        { date: '2024-05', value: 1600 },
        { date: '2024-06', value: 1550 + totalPnL },
      ]);

      // P&L History
      setPnlHistory([
        { date: 'Mon', pnl: 50 },
        { date: 'Tue', pnl: -20 },
        { date: 'Wed', pnl: 80 },
        { date: 'Thu', pnl: 30 },
        { date: 'Fri', pnl: -10 },
        { date: 'Sat', pnl: 60 },
        { date: 'Sun', pnl: totalPnL },
      ]);

      // Position Breakdown
      setPositionBreakdown([
        { name: 'Futures', value: futuresPositions.length, color: '#3b82f6' },
        { name: 'Options', value: optionsPositions.length, color: '#a855f7' },
        { name: 'Swaps', value: swapsPositions.length, color: '#10b981' },
      ]);

      // Performance by Type
      setPerformanceByType([
        { type: 'Futures', profit: 120, loss: -30 },
        { type: 'Options', profit: 80, loss: -20 },
        { type: 'Swaps', profit: 50, loss: -10 },
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Connect your wallet to view analytics</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );

  return (
    <>
      <Head>
        <title>Analytics - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
                  <p className="text-gray-400 text-sm">Track your trading performance</p>
                </div>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={DollarSign}
                  label="Total P&L"
                  value={`${analytics.totalPnL >= 0 ? '+' : ''}$${analytics.totalPnL.toFixed(2)}`}
                  change={12.5}
                  color="#10b981"
                />
                <StatCard
                  icon={Percent}
                  label="Win Rate"
                  value={`${analytics.winRate.toFixed(1)}%`}
                  color="#3b82f6"
                />
                <StatCard
                  icon={Target}
                  label="Total Trades"
                  value={analytics.totalTrades}
                  color="#a855f7"
                />
                <StatCard
                  icon={Clock}
                  label="Avg Hold Time"
                  value={`${analytics.avgHoldTime}d`}
                  color="#f59e0b"
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Portfolio Value Over Time */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Portfolio Value
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Area type="monotone" dataKey="value" stroke="#a855f7" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Position Breakdown */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Position Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={positionBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {positionBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily P&L */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily P&L
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pnlHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Bar dataKey="pnl" fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Performance by Type */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Performance by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="type" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Legend />
                      <Bar dataKey="profit" fill="#10b981" name="Profit" />
                      <Bar dataKey="loss" fill="#ef4444" name="Loss" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Best Trade</p>
                  <p className="text-2xl font-bold text-green-400">+${analytics.bestTrade.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Worst Trade</p>
                  <p className="text-2xl font-bold text-red-400">${analytics.worstTrade.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Total Collateral</p>
                  <p className="text-2xl font-bold text-white">${analytics.totalCollateral.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
