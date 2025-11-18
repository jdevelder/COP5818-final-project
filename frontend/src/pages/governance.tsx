import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  ArrowLeft,
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Users,
  Coins,
  AlertCircle,
  FileText,
  TrendingDown
} from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import MobileNav from '@/components/MobileNav';
import { useAccount } from 'wagmi';

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  category: 'platform' | 'fees' | 'listing' | 'technical';
  createdAt: number;
  endsAt: number;
  executed: boolean;
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 1,
    title: 'Reduce Trading Fees to 0.2%',
    description: 'Proposal to reduce trading fees from 0.3% to 0.2% to increase platform competitiveness and attract more traders. This would make our fees more competitive with other DeFi platforms while maintaining sustainable revenue.',
    proposer: '0x1234...5678',
    status: 'active',
    votesFor: 12500,
    votesAgainst: 3200,
    totalVotes: 15700,
    quorum: 10000,
    category: 'fees',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() + 5 * 24 * 60 * 60 * 1000,
    executed: false,
  },
  {
    id: 2,
    title: 'Add Pokemon Scarlet & Violet Cards',
    description: 'Proposal to add Pokemon Scarlet & Violet cards to the trading platform. This would expand our card offerings and attract Pokemon TCG collectors and traders. Initial liquidity pools would be created for the top 10 most valuable cards.',
    proposer: '0xabcd...efgh',
    status: 'active',
    votesFor: 18900,
    votesAgainst: 1100,
    totalVotes: 20000,
    quorum: 10000,
    category: 'listing',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() + 6 * 24 * 60 * 60 * 1000,
    executed: false,
  },
  {
    id: 3,
    title: 'Implement Cross-Chain Bridge to Polygon',
    description: 'Technical proposal to implement a cross-chain bridge to Polygon network. This would reduce gas fees for users and improve transaction speed. Security audit would be conducted before deployment.',
    proposer: '0x9876...5432',
    status: 'passed',
    votesFor: 25000,
    votesAgainst: 2000,
    totalVotes: 27000,
    quorum: 10000,
    category: 'technical',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    executed: true,
  },
  {
    id: 4,
    title: 'Increase Collateral Requirements to 30%',
    description: 'Proposal to increase futures contract collateral requirements from 20% to 30% to reduce platform risk during high volatility periods. This would improve platform stability but reduce leverage available to traders.',
    proposer: '0x5555...6666',
    status: 'rejected',
    votesFor: 4500,
    votesAgainst: 18500,
    totalVotes: 23000,
    quorum: 10000,
    category: 'platform',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    endsAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    executed: false,
  },
];

export default function GovernancePage() {
  const { address, isConnected } = useAccount();
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userVotingPower] = useState(1000); // Mock voting power

  const filteredProposals = proposals.filter(p =>
    selectedFilter === 'all' ? true : p.status === selectedFilter
  );

  const handleVote = (proposalId: number, support: boolean) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: support ? p.votesFor + userVotingPower : p.votesFor,
          votesAgainst: !support ? p.votesAgainst + userVotingPower : p.votesAgainst,
          totalVotes: p.totalVotes + userVotingPower,
        };
      }
      return p;
    }));

    alert(`Vote ${support ? 'FOR' : 'AGAINST'} submitted successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'passed':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'rejected':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'platform':
        return 'bg-purple-500/20 text-purple-500';
      case 'fees':
        return 'bg-green-500/20 text-green-500';
      case 'listing':
        return 'bg-blue-500/20 text-blue-500';
      case 'technical':
        return 'bg-orange-500/20 text-orange-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const calculateVotePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return (votes / total) * 100;
  };

  return (
    <>
      <Head>
        <title>DAO Governance - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen">
        <MobileNav />

        {/* Header */}
        <header className="hidden lg:block border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Vote className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">DAO Governance</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <ThemeToggle />
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Vote className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Proposals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {proposals.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Voters</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Voting Power</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userVotingPower.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passed Proposals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {proposals.filter(p => p.status === 'passed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Governance Proposals
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Vote on platform decisions and shape the future of TCG Derivatives
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Proposal
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { value: 'all', label: 'All Proposals' },
              { value: 'active', label: 'Active' },
              { value: 'passed', label: 'Passed' },
              { value: 'rejected', label: 'Rejected' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value as any)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
                  selectedFilter === filter.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Proposals List */}
          <div className="space-y-6">
            {filteredProposals.map(proposal => {
              const forPercentage = calculateVotePercentage(proposal.votesFor, proposal.totalVotes);
              const againstPercentage = calculateVotePercentage(proposal.votesAgainst, proposal.totalVotes);
              const quorumPercentage = calculateVotePercentage(proposal.totalVotes, proposal.quorum);
              const timeRemaining = proposal.endsAt - Date.now();
              const daysRemaining = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));

              return (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6 hover:bg-white/90 dark:hover:bg-white/10 transition"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(proposal.category)}`}>
                          {proposal.category.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                          {getStatusIcon(proposal.status)}
                          {proposal.status.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {proposal.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {proposal.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>Proposed by {proposal.proposer}</span>
                        <span>•</span>
                        <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                        {proposal.status === 'active' && daysRemaining > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-blue-500 font-semibold">
                              {daysRemaining} days remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Voting Stats */}
                  <div className="mb-4">
                    {/* Vote Bars */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          For: {proposal.votesFor.toLocaleString()} ({forPercentage.toFixed(1)}%)
                        </span>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                          Against: {proposal.votesAgainst.toLocaleString()} ({againstPercentage.toFixed(1)}%)
                          <ThumbsDown className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-green-500 transition-all"
                          style={{ width: `${forPercentage}%` }}
                        />
                        <div
                          className="bg-red-500 transition-all"
                          style={{ width: `${againstPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Quorum Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Quorum: {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
                        </span>
                        <span className={`text-xs font-semibold ${quorumPercentage >= 100 ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'}`}>
                          {quorumPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${quorumPercentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(quorumPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  {proposal.status === 'active' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(proposal.id, true)}
                        className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, false)}
                        className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        Vote Against
                      </button>
                    </div>
                  )}

                  {proposal.status === 'passed' && proposal.executed && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-500/10 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Proposal executed successfully</span>
                    </div>
                  )}

                  {proposal.status === 'rejected' && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-500/10 rounded-lg p-3">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Proposal did not pass</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
