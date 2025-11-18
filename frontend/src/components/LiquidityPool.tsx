import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Plus, Minus, TrendingUp, Award, Info, DollarSign, Percent } from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';

interface PoolStats {
  totalLiquidity: string;
  userLiquidity: string;
  userShare: number;
  lpTokens: string;
  earnedFees: string;
  apr: number;
}

export default function LiquidityPool() {
  const { address, isConnected } = useAccount();
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock pool stats - in production, fetch from blockchain
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalLiquidity: '1250000',
    userLiquidity: '5000',
    userShare: 0.4,
    lpTokens: '5000',
    earnedFees: '125.50',
    apr: 18.5,
  });

  const handleAddLiquidity = async () => {
    if (!isConnected || !amount) return;
    setLoading(true);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update stats
      const newLiquidity = parseFloat(poolStats.userLiquidity) + parseFloat(amount);
      const newTotal = parseFloat(poolStats.totalLiquidity) + parseFloat(amount);

      setPoolStats({
        ...poolStats,
        totalLiquidity: newTotal.toString(),
        userLiquidity: newLiquidity.toString(),
        lpTokens: newLiquidity.toString(),
        userShare: (newLiquidity / newTotal) * 100,
      });

      setAmount('');
      alert('Successfully added liquidity!');
    } catch (error) {
      console.error('Error adding liquidity:', error);
      alert('Failed to add liquidity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!isConnected || !amount) return;
    setLoading(true);

    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update stats
      const newLiquidity = Math.max(0, parseFloat(poolStats.userLiquidity) - parseFloat(amount));
      const newTotal = parseFloat(poolStats.totalLiquidity) - parseFloat(amount);

      setPoolStats({
        ...poolStats,
        totalLiquidity: newTotal.toString(),
        userLiquidity: newLiquidity.toString(),
        lpTokens: newLiquidity.toString(),
        userShare: newTotal > 0 ? (newLiquidity / newTotal) * 100 : 0,
      });

      setAmount('');
      alert('Successfully removed liquidity!');
    } catch (error) {
      console.error('Error removing liquidity:', error);
      alert('Failed to remove liquidity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pool Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Liquidity</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${parseFloat(poolStats.totalLiquidity).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Your Liquidity</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${parseFloat(poolStats.userLiquidity).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-500" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">LP Tokens</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {parseFloat(poolStats.lpTokens).toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 text-orange-500" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">APR</p>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {poolStats.apr}%
          </p>
        </motion.div>
      </div>

      {/* Pool Information */}
      <div className="bg-blue-100 dark:bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-blue-900 dark:text-blue-400 mb-1">How Liquidity Pools Work</p>
            <p className="text-blue-800 dark:text-blue-300">
              Provide liquidity to earn a share of trading fees. You'll receive LP tokens representing your share of the pool.
              The more liquidity you provide, the more fees you earn. APR varies based on trading volume.
            </p>
          </div>
        </div>
      </div>

      {/* Add/Remove Liquidity Interface */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manage Liquidity</h2>

        {/* Action Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAction('add')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              action === 'add'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Liquidity
          </button>
          <button
            onClick={() => setAction('remove')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              action === 'remove'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/10'
            }`}
          >
            <Minus className="w-5 h-5 inline mr-2" />
            Remove Liquidity
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {action === 'remove' && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Available to withdraw: ${parseFloat(poolStats.userLiquidity).toLocaleString()}
            </p>
          )}
        </div>

        {/* Quick Amount Buttons */}
        {action === 'remove' && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAmount((parseFloat(poolStats.userLiquidity) * 0.25).toString())}
              className="flex-1 py-2 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/10 transition"
            >
              25%
            </button>
            <button
              onClick={() => setAmount((parseFloat(poolStats.userLiquidity) * 0.5).toString())}
              className="flex-1 py-2 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/10 transition"
            >
              50%
            </button>
            <button
              onClick={() => setAmount((parseFloat(poolStats.userLiquidity) * 0.75).toString())}
              className="flex-1 py-2 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/10 transition"
            >
              75%
            </button>
            <button
              onClick={() => setAmount(poolStats.userLiquidity)}
              className="flex-1 py-2 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-white/10 transition"
            >
              MAX
            </button>
          </div>
        )}

        {/* Pool Share Preview */}
        <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-400">Current Share</span>
            <span className="text-gray-900 dark:text-white font-semibold">{poolStats.userShare.toFixed(2)}%</span>
          </div>
          {amount && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">New Share</span>
              <span className="text-gray-900 dark:text-white font-semibold">
                {action === 'add'
                  ? (
                      ((parseFloat(poolStats.userLiquidity) + parseFloat(amount)) /
                        (parseFloat(poolStats.totalLiquidity) + parseFloat(amount))) *
                      100
                    ).toFixed(2)
                  : (
                      ((parseFloat(poolStats.userLiquidity) - parseFloat(amount)) /
                        (parseFloat(poolStats.totalLiquidity) - parseFloat(amount))) *
                      100
                    ).toFixed(2)}
                %
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={action === 'add' ? handleAddLiquidity : handleRemoveLiquidity}
          disabled={!isConnected || !amount || loading}
          className={`w-full py-4 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
            action === 'add'
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
              : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90'
          }`}
        >
          {!isConnected
            ? 'Connect Wallet'
            : loading
            ? 'Processing...'
            : action === 'add'
            ? 'Add Liquidity'
            : 'Remove Liquidity'}
        </button>
      </div>

      {/* Earned Fees */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Earnings</h2>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Earned Fees</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${poolStats.earnedFees}
            </p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition">
            Claim Fees
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Daily Earnings</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">$6.85</p>
          </div>
          <div className="bg-gray-100 dark:bg-white/5 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly Projection</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">$205.50</p>
          </div>
        </div>
      </div>
    </div>
  );
}
