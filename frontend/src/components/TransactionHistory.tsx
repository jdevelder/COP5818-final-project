import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Download, FileText, Table, Filter, Calendar } from 'lucide-react';
import { formatEther } from 'viem';
import { useFutures } from '@/hooks/useFutures';
import { useOptions } from '@/hooks/useOptions';
import { useSwaps } from '@/hooks/useSwaps';
import {
  exportToCSV,
  exportToPDF,
  getTransactionSummary,
  type Transaction,
} from '@/utils/exportTransactions';
import toast from 'react-hot-toast';

export default function TransactionHistory() {
  const { address } = useAccount();
  const { getUserPositions: getFuturesPositions, getPosition: getFuturesDetails } = useFutures();
  const { getBuyerOptions, getOption } = useOptions();
  const { getUserSwaps, getSwap } = useSwaps();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'futures' | 'options' | 'swaps'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  useEffect(() => {
    if (address) {
      loadTransactions();
    }
  }, [address]);

  async function loadTransactions() {
    setLoading(true);
    try {
      const allTransactions: Transaction[] = [];

      // Load futures positions
      const futuresIds = await getFuturesPositions(address!);
      for (const id of futuresIds) {
        const pos = await getFuturesDetails(Number(id));
        if (pos) {
          allTransactions.push({
            id: `F-${id}`,
            date: new Date(Number(pos.openTime) * 1000).toISOString(),
            type: 'Futures',
            side: pos.side === 0 ? 'Long' : 'Short',
            cardId: pos.cardId,
            entryPrice: formatEther(pos.entryPrice),
            exitPrice: pos.status === 1 ? formatEther(pos.exitPrice) : undefined,
            quantity: Number(pos.quantity),
            pnl: formatEther(pos.currentPnL),
            status: pos.status === 0 ? 'Active' : pos.status === 1 ? 'Closed' : 'Expired',
            collateral: formatEther(pos.collateral),
          });
        }
      }

      // Load options
      const optionsIds = await getBuyerOptions(address!);
      for (const id of optionsIds) {
        const opt = await getOption(Number(id));
        if (opt) {
          allTransactions.push({
            id: `O-${id}`,
            date: new Date(Number(opt.createdAt) * 1000).toISOString(),
            type: 'Options',
            side: opt.optionType === 0 ? 'Call' : 'Put',
            cardId: opt.cardId,
            entryPrice: formatEther(opt.strikePrice),
            quantity: Number(opt.quantity),
            pnl: '0', // Options P&L calculation would need more logic
            status: opt.status === 0 ? 'Active' : opt.status === 1 ? 'Closed' : 'Expired',
            collateral: formatEther(opt.premium),
          });
        }
      }

      // Load swaps
      const swapsIds = await getUserSwaps(address!);
      for (const id of swapsIds) {
        const swap = await getSwap(Number(id));
        if (swap) {
          allTransactions.push({
            id: `S-${id}`,
            date: new Date(Number(swap.startTime) * 1000).toISOString(),
            type: 'Swaps',
            side: 'Swap',
            cardId: `${swap.cardIdA}/${swap.cardIdB}`,
            entryPrice: formatEther(swap.notionalA),
            quantity: 1,
            pnl: formatEther(swap.currentPnLA),
            status: swap.status === 1 ? 'Active' : 'Closed',
            collateral: formatEther(swap.marginA),
          });
        }
      }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type.toLowerCase() !== filter) return false;
    if (statusFilter !== 'all' && tx.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const summary = getTransactionSummary(filteredTransactions);

  const handleExportCSV = () => {
    exportToCSV(filteredTransactions, `tcg-transactions-${Date.now()}.csv`);
    toast.success('CSV exported successfully!');
  };

  const handleExportPDF = () => {
    exportToPDF(filteredTransactions, address || '', `tcg-transactions-${Date.now()}.pdf`);
    toast.success('PDF exported successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 light:bg-white/70 border border-white/10 light:border-gray-300">
          <div className="text-gray-400 light:text-gray-600 text-sm mb-1">Total Transactions</div>
          <div className="text-2xl font-bold text-white light:text-gray-900">{summary.totalTransactions}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 light:bg-white/70 border border-white/10 light:border-gray-300">
          <div className="text-gray-400 light:text-gray-600 text-sm mb-1">Total P&L</div>
          <div className={`text-2xl font-bold ${summary.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.totalPnL >= 0 ? '+' : ''}{summary.totalPnL.toFixed(4)} ETH
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 light:bg-white/70 border border-white/10 light:border-gray-300">
          <div className="text-gray-400 light:text-gray-600 text-sm mb-1">Win Rate</div>
          <div className="text-2xl font-bold text-white light:text-gray-900">
            {summary.totalTransactions > 0
              ? ((summary.winningTrades / summary.totalTransactions) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 light:bg-white/70 border border-white/10 light:border-gray-300">
          <div className="text-gray-400 light:text-gray-600 text-sm mb-1">Active Positions</div>
          <div className="text-2xl font-bold text-white light:text-gray-900">{summary.activeCount}</div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/10 light:bg-white border border-white/20 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Types</option>
            <option value="futures">Futures</option>
            <option value="options">Options</option>
            <option value="swaps">Swaps</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/10 light:bg-white border border-white/20 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Table className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/5 light:bg-white/70 backdrop-blur-md border border-white/10 light:border-gray-300 rounded-2xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 light:text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 light:bg-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 light:text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 light:text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 light:text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 light:text-gray-700">Side</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 light:text-gray-700">Card</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300 light:text-gray-700">Entry</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300 light:text-gray-700">P&L</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 light:text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <tr
                    key={tx.id}
                    className={`border-t border-white/10 light:border-gray-300 ${
                      index % 2 === 0 ? 'bg-white/5 light:bg-gray-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-300 light:text-gray-700 font-mono">{tx.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 light:text-gray-700">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 light:text-gray-700">{tx.type}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          tx.side === 'Long' || tx.side === 'Call'
                            ? 'bg-green-500/20 text-green-400'
                            : tx.side === 'Short' || tx.side === 'Put'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {tx.side}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 light:text-gray-700">
                      {tx.cardId.replace(/-/g, ' ').substring(0, 20)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300 light:text-gray-700 font-mono">
                      {parseFloat(tx.entryPrice).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      <span className={parseFloat(tx.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {parseFloat(tx.pnl) >= 0 ? '+' : ''}
                        {parseFloat(tx.pnl).toFixed(4)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          tx.status === 'Active'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : tx.status === 'Closed'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
