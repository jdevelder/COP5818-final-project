import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useSwaps, Swap } from '@/hooks/useSwaps';
import { Zap, Calendar, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SwapMarketplace() {
  const { address } = useAccount();
  const { getActiveSwaps, getSwap, acceptSwap, loading } = useSwaps();
  const [availableSwaps, setAvailableSwaps] = useState<Swap[]>([]);
  const [loadingSwaps, setLoadingSwaps] = useState(true);
  const [acceptingSwapId, setAcceptingSwapId] = useState<number | null>(null);

  useEffect(() => {
    loadAvailableSwaps();
  }, [address]);

  async function loadAvailableSwaps() {
    setLoadingSwaps(true);
    try {
      // Get all active (pending) swaps
      const swapIds = await getActiveSwaps(0, 20);

      // Fetch details for each swap
      const swaps = await Promise.all(
        swapIds.map(id => getSwap(Number(id)))
      );

      // Filter out null results and swaps created by current user
      const validSwaps = swaps.filter(
        swap => swap !== null && swap.partyA.toLowerCase() !== address?.toLowerCase()
      ) as Swap[];

      setAvailableSwaps(validSwaps);
    } catch (error) {
      console.error('Error loading available swaps:', error);
      toast.error('Failed to load available swaps');
    } finally {
      setLoadingSwaps(false);
    }
  }

  const handleAcceptSwap = async (swap: Swap) => {
    setAcceptingSwapId(Number(swap.swapId));
    try {
      await acceptSwap(Number(swap.swapId), formatEther(swap.notionalValueB));
      toast.success('Swap accepted! Check your active positions.');
      // Reload available swaps after acceptance
      setTimeout(() => {
        loadAvailableSwaps();
      }, 2000);
    } catch (error) {
      console.error('Error accepting swap:', error);
    } finally {
      setAcceptingSwapId(null);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Connect your wallet to view available swaps</p>
      </div>
    );
  }

  if (loadingSwaps) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-gray-400 mt-4">Loading available swaps...</p>
      </div>
    );
  }

  if (availableSwaps.length === 0) {
    return (
      <div className="text-center py-12">
        <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No swaps available to accept</p>
        <p className="text-sm text-gray-500 mt-2">Check back later or create your own swap proposal</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Available Swaps ({availableSwaps.length})
        </h3>
        <button
          onClick={loadAvailableSwaps}
          className="text-sm text-purple-400 hover:text-purple-300 transition"
        >
          Refresh
        </button>
      </div>

      {availableSwaps.map((swap) => (
        <div
          key={swap.swapId.toString()}
          className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6 hover:bg-white/80 dark:hover:bg-white/10 transition"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {swap.cardIdA} ⇄ {swap.cardIdB}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Proposed by: {swap.partyA.slice(0, 6)}...{swap.partyA.slice(-4)}
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 bg-yellow-500/20 text-yellow-400">
                Pending Acceptance
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Your Collateral</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(parseFloat(formatEther(swap.notionalValueB)) * 0.15).toFixed(4)} ETH
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                (15% of {formatEther(swap.notionalValueB)} ETH)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div>
              <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Card A Value
              </div>
              <div className="text-gray-900 dark:text-white font-semibold">
                {formatEther(swap.notionalValueA)} ETH
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Card B Value (Your Side)
              </div>
              <div className="text-gray-900 dark:text-white font-semibold">
                {formatEther(swap.notionalValueB)} ETH
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Maturity
              </div>
              <div className="text-gray-900 dark:text-white font-semibold">
                {new Date(Number(swap.maturityDate) * 1000).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              <strong>How it works:</strong> You'll profit if <strong>{swap.cardIdB}</strong> performs better than{' '}
              <strong>{swap.cardIdA}</strong>. The other party profits if the opposite happens. Net settlement at maturity.
            </p>
          </div>

          <button
            onClick={() => handleAcceptSwap(swap)}
            disabled={loading || acceptingSwapId === Number(swap.swapId)}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acceptingSwapId === Number(swap.swapId) ? 'Accepting...' : 'Accept Swap'}
          </button>
        </div>
      ))}
    </div>
  );
}
