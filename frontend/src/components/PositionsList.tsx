import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useFutures, FuturesPosition } from '@/hooks/useFutures';
import { useOptions, Option } from '@/hooks/useOptions';
import { useSwaps, Swap } from '@/hooks/useSwaps';
import { TrendingUp, Shield, Zap, Calendar, DollarSign } from 'lucide-react';

type PositionType = 'futures' | 'options' | 'swaps' | 'all';

export default function PositionsList() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<PositionType>('all');
  const [loading, setLoading] = useState(true);

  const { getUserPositions: getFuturesPositions, getPosition: getFuturesDetails, settlePosition } = useFutures();
  const { getBuyerOptions, getOption, exerciseOption } = useOptions();
  const { getUserSwaps, getSwap, settleSwap } = useSwaps();

  const [futuresPositions, setFuturesPositions] = useState<FuturesPosition[]>([]);
  const [optionsPositions, setOptionsPositions] = useState<Option[]>([]);
  const [swapsPositions, setSwapsPositions] = useState<Swap[]>([]);

  useEffect(() => {
    loadPositions();
  }, [address]);

  async function loadPositions() {
    if (!address) return;

    setLoading(true);
    try {
      // Load futures
      const futuresIds = await getFuturesPositions(address);
      console.log('Futures IDs:', futuresIds);
      const futures = await Promise.all(
        futuresIds.map(id => getFuturesDetails(Number(id)))
      );
      setFuturesPositions(futures.filter(p => p !== null) as FuturesPosition[]);
      console.log('Loaded futures positions:', futures.length);

      // Load options
      const optionsIds = await getBuyerOptions(address);
      console.log('Options IDs:', optionsIds);
      const options = await Promise.all(
        optionsIds.map(id => getOption(Number(id)))
      );
      setOptionsPositions(options.filter(o => o !== null) as Option[]);
      console.log('Loaded options positions:', options.length);

      // Load swaps
      const swapsIds = await getUserSwaps(address);
      console.log('Swaps IDs:', swapsIds);
      const swaps = await Promise.all(
        swapsIds.map(id => getSwap(Number(id)))
      );
      console.log('Loaded swaps raw data:', swaps);
      setSwapsPositions(swaps.filter(s => s !== null) as Swap[]);
      console.log('Loaded swaps positions:', swaps.length);
    } catch (error) {
      console.error('Error loading positions:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSettle = async (positionId: number, type: 'futures' | 'swaps') => {
    if (type === 'futures') {
      await settlePosition(positionId);
    } else {
      await settleSwap(positionId);
    }
    loadPositions();
  };

  const handleExercise = async (optionId: number) => {
    await exerciseOption(optionId);
    loadPositions();
  };

  const getStatusColor = (status: number, type: 'futures' | 'options' | 'swaps' = 'futures') => {
    switch (status) {
      case 0:
        return type === 'swaps'
          ? 'bg-yellow-500/20 text-yellow-400'  // PENDING for swaps
          : 'bg-green-500/20 text-green-400';   // ACTIVE for futures/options
      case 1: return 'bg-green-500/20 text-green-400';   // ACTIVE for swaps, SETTLED for futures/options
      case 2: return 'bg-blue-500/20 text-blue-400';     // SETTLED for swaps, LIQUIDATED for futures
      case 3: return 'bg-gray-500/20 text-gray-400';     // CANCELLED
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: number, type: 'futures' | 'options' | 'swaps' = 'futures') => {
    if (type === 'swaps') {
      const swapStatusMap = ['Pending', 'Active', 'Settled', 'Cancelled'];
      return swapStatusMap[status] || 'Unknown';
    }
    const statusMap = ['Active', 'Settled', 'Liquidated', 'Cancelled'];
    return statusMap[status] || 'Unknown';
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Connect your wallet to view positions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-gray-400 mt-4">Loading positions...</p>
      </div>
    );
  }

  const totalPositions = futuresPositions.length + optionsPositions.length + swapsPositions.length;

  if (totalPositions === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No active positions yet</p>
        <p className="text-sm text-gray-500 mt-2">Open your first position to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { key: 'all', label: 'All', icon: null, count: totalPositions },
          { key: 'futures', label: 'Futures', icon: TrendingUp, count: futuresPositions.length },
          { key: 'options', label: 'Options', icon: Shield, count: optionsPositions.length },
          { key: 'swaps', label: 'Swaps', icon: Zap, count: swapsPositions.length },
        ].map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as PositionType)}
            className={`px-4 py-2 font-semibold transition flex items-center gap-2 ${
              activeTab === key
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">{count}</span>
          </button>
        ))}
      </div>

      {/* Futures Positions */}
      {(activeTab === 'all' || activeTab === 'futures') && futuresPositions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Futures Positions
          </h3>
          {futuresPositions.map((position) => (
            <div
              key={position.positionId.toString()}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{position.cardId}</h4>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      position.positionType === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {position.positionType === 0 ? 'LONG' : 'SHORT'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(position.status, 'futures')}`}>
                      {getStatusText(position.status, 'futures')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {parseFloat(formatEther(position.currentPnL)) >= 0 ? '+' : ''}
                    {parseFloat(formatEther(position.currentPnL)).toFixed(4)} ETH
                  </div>
                  <div className={`text-sm ${
                    parseFloat(formatEther(position.currentPnL)) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    P&L
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Strike Price</div>
                  <div className="text-white font-semibold">{formatEther(position.strikePrice)} ETH</div>
                </div>
                <div>
                  <div className="text-gray-400">Quantity</div>
                  <div className="text-white font-semibold">{position.quantity.toString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Collateral</div>
                  <div className="text-white font-semibold">{formatEther(position.collateral)} ETH</div>
                </div>
                <div>
                  <div className="text-gray-400">Expiry</div>
                  <div className="text-white font-semibold">
                    {new Date(Number(position.expiryDate) * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {position.status === 0 && Date.now() >= Number(position.expiryDate) * 1000 && (
                <button
                  onClick={() => handleSettle(Number(position.positionId), 'futures')}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Settle Position
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options Positions */}
      {(activeTab === 'all' || activeTab === 'options') && optionsPositions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Options Positions
          </h3>
          {optionsPositions.map((option) => (
            <div
              key={option.optionId.toString()}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">{option.cardId}</h4>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      option.optionType === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {option.optionType === 0 ? 'CALL' : 'PUT'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(option.status, 'options')}`}>
                      {getStatusText(option.status, 'options')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatEther(option.premium)} ETH
                  </div>
                  <div className="text-sm text-gray-400">Premium Paid</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Strike Price</div>
                  <div className="text-white font-semibold">{formatEther(option.strikePrice)} ETH</div>
                </div>
                <div>
                  <div className="text-gray-400">Quantity</div>
                  <div className="text-white font-semibold">{option.quantity.toString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Expiry</div>
                  <div className="text-white font-semibold">
                    {new Date(Number(option.expiryDate) * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {option.status === 0 && Date.now() < Number(option.expiryDate) * 1000 && (
                <button
                  onClick={() => handleExercise(Number(option.optionId))}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Exercise Option
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Swaps Positions */}
      {(activeTab === 'all' || activeTab === 'swaps') && swapsPositions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Swaps Positions
          </h3>
          {swapsPositions.map((swap) => (
            <div
              key={swap.swapId.toString()}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {swap.cardIdA} ⇄ {swap.cardIdB}
                  </h4>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(swap.status, 'swaps')}`}>
                    {getStatusText(swap.status, 'swaps')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {parseFloat(formatEther(swap.currentPnLA)) >= 0 ? '+' : ''}
                    {parseFloat(formatEther(swap.currentPnLA)).toFixed(4)} ETH
                  </div>
                  <div className={`text-sm ${
                    parseFloat(formatEther(swap.currentPnLA)) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Current P&L
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Card A Notional</div>
                  <div className="text-white font-semibold">{formatEther(swap.notionalValueA)} ETH</div>
                </div>
                <div>
                  <div className="text-gray-400">Card B Notional</div>
                  <div className="text-white font-semibold">{formatEther(swap.notionalValueB)} ETH</div>
                </div>
                <div>
                  <div className="text-gray-400">Maturity</div>
                  <div className="text-white font-semibold">
                    {new Date(Number(swap.maturityDate) * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Show action buttons based on status */}
              {swap.status === 0 && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm font-semibold">
                    ⏳ Waiting for counterparty to accept this swap
                  </p>
                </div>
              )}
              {swap.status === 1 && Date.now() >= Number(swap.maturityDate) * 1000 && (
                <button
                  onClick={() => handleSettle(Number(swap.swapId), 'swaps')}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Settle Swap
                </button>
              )}
              {swap.status === 1 && Date.now() < Number(swap.maturityDate) * 1000 && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm font-semibold">
                    ✓ Swap is active. Matures on {new Date(Number(swap.maturityDate) * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
