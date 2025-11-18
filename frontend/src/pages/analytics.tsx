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
  Download,
  RefreshCw,
  Filter,
  Flame,
  Shield,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
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
  const [timeFilter, setTimeFilter] = useState('7d');
  const [analytics, setAnalytics] = useState({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    avgHoldTime: 0,
    bestTrade: 0,
    worstTrade: 0,
    totalCollateral: 0,
    activePositions: 0,
    roi: 0,
    totalVolume: 0,
    avgProfit: 0,
    avgLoss: 0,
    profitFactor: 0,
  });

  const [portfolioData, setPortfolioData] = useState<any[]>([]);
  const [pnlHistory, setPnlHistory] = useState<any[]>([]);
  const [positionBreakdown, setPositionBreakdown] = useState<any[]>([]);
  const [performanceByType, setPerformanceByType] = useState<any[]>([]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
  const [cardPerformance, setCardPerformance] = useState<any[]>([]);

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

      // Calculate ROI
      const roi = totalCollateral > 0 ? (totalPnL / totalCollateral) * 100 : 0;

      // Calculate average profit and loss
      const profits = pnlValues.filter(v => v > 0);
      const losses_array = pnlValues.filter(v => v < 0);
      const avgProfit = profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 0;
      const avgLoss = losses_array.length > 0 ? losses_array.reduce((a, b) => a + b, 0) / losses_array.length : 0;

      // Calculate profit factor (gross profit / gross loss)
      const grossProfit = profits.reduce((a, b) => a + b, 0);
      const grossLoss = Math.abs(losses_array.reduce((a, b) => a + b, 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

      setAnalytics({
        totalPnL,
        winRate,
        totalTrades,
        avgHoldTime: 7, // Mock data
        bestTrade: pnlValues.length > 0 ? Math.max(...pnlValues) : 0,
        worstTrade: pnlValues.length > 0 ? Math.min(...pnlValues) : 0,
        totalCollateral,
        activePositions: activeCount,
        roi,
        totalVolume: totalCollateral, // Simplified for now
        avgProfit,
        avgLoss,
        profitFactor,
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

      // Monthly Performance
      setMonthlyPerformance([
        { month: 'Jan', pnl: 150, trades: 12 },
        { month: 'Feb', pnl: 230, trades: 18 },
        { month: 'Mar', pnl: -50, trades: 8 },
        { month: 'Apr', pnl: 420, trades: 25 },
        { month: 'May', pnl: 180, trades: 15 },
        { month: 'Jun', pnl: totalPnL, trades: totalTrades },
      ]);

      // Card Performance (Top performing cards)
      setCardPerformance([
        { name: 'Charizard Base Set', trades: 5, pnl: 250, roi: 45 },
        { name: 'Black Lotus Alpha', trades: 2, pnl: 500, roi: 80 },
        { name: 'Pikachu Illustrator', trades: 3, pnl: -50, roi: -12 },
        { name: 'Mox Sapphire', trades: 4, pnl: 180, roi: 35 },
        { name: 'Blastoise Base Set', trades: 6, pnl: 120, roi: 28 },
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
          <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your wallet to view analytics</p>
          <WalletButton />
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-opacity-20`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );

  return (
    <>
      <Head>
        <title>Analytics - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Track your trading performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadAnalytics()}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition"
                  title="Refresh data"
                >
                  <RefreshCw className="w-5 h-5 text-gray-900 dark:text-white" />
                </button>
                <ThemeToggle />
                <WalletButton />
              </div>
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
              {/* Time Filter */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-semibold">Time Period:</span>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d', '1y', 'All'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeFilter(period)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          timeFilter === period
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics - Row 1 */}
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
                  icon={Flame}
                  label="ROI"
                  value={`${analytics.roi >= 0 ? '+' : ''}${analytics.roi.toFixed(1)}%`}
                  change={analytics.roi}
                  color="#f59e0b"
                />
              </div>

              {/* Key Metrics - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Shield}
                  label="Profit Factor"
                  value={analytics.profitFactor.toFixed(2)}
                  color="#06b6d4"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Avg Profit"
                  value={`$${analytics.avgProfit.toFixed(2)}`}
                  color="#10b981"
                />
                <StatCard
                  icon={BarChart3}
                  label="Avg Loss"
                  value={`$${analytics.avgLoss.toFixed(2)}`}
                  color="#ef4444"
                />
                <StatCard
                  icon={Activity}
                  label="Active Positions"
                  value={analytics.activePositions}
                  color="#8b5cf6"
                />
              </div>

              {/* Charts Row 1 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Portfolio Value Over Time */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.2)" />
                      <XAxis dataKey="date" stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(100,100,100,0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#a855f7" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Position Breakdown */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(100,100,100,0.2)',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2 */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily P&L */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Daily P&L
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={pnlHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.2)" />
                      <XAxis dataKey="date" stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(100,100,100,0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="pnl" fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Performance by Type */}
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Performance by Type
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.2)" />
                      <XAxis dataKey="type" stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(100,100,100,0.2)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="profit" fill="#10b981" name="Profit" />
                      <Bar dataKey="loss" fill="#ef4444" name="Loss" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Best Trade</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">+${analytics.bestTrade.toFixed(2)}</p>
                </div>
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Worst Trade</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">${analytics.worstTrade.toFixed(2)}</p>
                </div>
                <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Collateral</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${analytics.totalCollateral.toFixed(2)}</p>
                </div>
              </div>

              {/* Monthly Performance Chart */}
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.2)" />
                    <XAxis dataKey="month" stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="left" stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="rgba(100,100,100,0.7)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(100,100,100,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="pnl" stroke="#10b981" strokeWidth={3} name="P&L ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="trades" stroke="#3b82f6" strokeWidth={2} name="Trades" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Performing Cards */}
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Performing Cards
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-white/10">
                        <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Card</th>
                        <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">Trades</th>
                        <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">P&L</th>
                        <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300 font-semibold">ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardPerformance.map((card, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition">
                          <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{card.name}</td>
                          <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{card.trades}</td>
                          <td className={`py-3 px-4 text-right font-semibold ${card.pnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {card.pnl >= 0 ? '+' : ''}${card.pnl.toFixed(2)}
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold ${card.roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {card.roi >= 0 ? '+' : ''}{card.roi}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
