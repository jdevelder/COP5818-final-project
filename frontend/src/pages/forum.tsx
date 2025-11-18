import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Plus,
  X,
  Send,
  Flame,
  Clock,
  Trophy,
  Tag,
  Search,
} from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import MobileNav from '@/components/MobileNav';
import { useAccount } from 'wagmi';

interface Thread {
  id: number;
  title: string;
  content: string;
  author: string;
  category: 'trading' | 'cards' | 'general' | 'help';
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: number;
  isPinned: boolean;
}

const MOCK_THREADS: Thread[] = [
  {
    id: 1,
    title: 'Best strategy for hedging Charizard positions?',
    content: 'I have a large LONG position on Charizard Base Set and want to hedge against potential downside. Should I buy protective puts or use a collar strategy? What strike prices would you recommend?',
    author: '0x1234...5678',
    category: 'trading',
    upvotes: 45,
    downvotes: 3,
    commentCount: 12,
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    isPinned: true,
  },
  {
    id: 2,
    title: 'Black Lotus Alpha prices seem undervalued',
    content: 'Looking at historical data, Black Lotus Alpha is trading 15% below its 6-month average. Market sentiment seems bearish but fundamentals are strong. Anyone else seeing this as a buying opportunity?',
    author: '0xabcd...efgh',
    category: 'cards',
    upvotes: 67,
    downvotes: 12,
    commentCount: 24,
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    isPinned: false,
  },
  {
    id: 3,
    title: 'Welcome to the TCG Derivatives Community!',
    content: 'Introduce yourself here! Share your trading experience, favorite cards, and what brought you to derivatives trading. Looking forward to meeting everyone!',
    author: '0x0000...0001',
    category: 'general',
    upvotes: 123,
    downvotes: 2,
    commentCount: 89,
    createdAt: Date.now() - 24 * 60 * 60 * 1000,
    isPinned: true,
  },
  {
    id: 4,
    title: 'How do futures contracts work on this platform?',
    content: 'New to derivatives trading and trying to understand how futures work here. What happens at expiration? How is settlement calculated? Any recommended resources for learning?',
    author: '0x5555...6666',
    category: 'help',
    upvotes: 34,
    downvotes: 1,
    commentCount: 18,
    createdAt: Date.now() - 8 * 60 * 60 * 1000,
    isPinned: false,
  },
  {
    id: 5,
    title: 'Iron Condor strategy on Pokemon cards - Results after 30 days',
    content: 'Sharing my results from running an iron condor strategy on Pikachu EX for the past month. Net profit: +12.5% with max risk of 5%. Here\'s my detailed breakdown and lessons learned...',
    author: '0x9999...8888',
    category: 'trading',
    upvotes: 89,
    downvotes: 5,
    commentCount: 31,
    createdAt: Date.now() - 12 * 60 * 60 * 1000,
    isPinned: false,
  },
  {
    id: 6,
    title: 'Scarlet & Violet cards coming to the platform?',
    content: 'Has anyone heard if Pokemon Scarlet & Violet cards will be added soon? I saw a governance proposal but wondering about the timeline. Really want to trade SV derivatives!',
    author: '0x7777...3333',
    category: 'general',
    upvotes: 56,
    downvotes: 4,
    commentCount: 15,
    createdAt: Date.now() - 15 * 60 * 60 * 1000,
    isPinned: false,
  },
];

export default function ForumPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trading' | 'cards' | 'general' | 'help'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Create thread state
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState<'trading' | 'cards' | 'general' | 'help'>('general');

  const handleCreateThread = () => {
    if (!isConnected) {
      alert('Please connect your wallet to create a thread');
      return;
    }

    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newThread: Thread = {
      id: threads.length + 1,
      title: newThreadTitle,
      content: newThreadContent,
      author: address || '0x0000...0000',
      category: newThreadCategory,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      createdAt: Date.now(),
      isPinned: false,
    };

    setThreads([newThread, ...threads]);
    setShowCreateModal(false);
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadCategory('general');
  };

  const handleVote = (threadId: number, isUpvote: boolean) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }

    setThreads(prev => prev.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          upvotes: isUpvote ? thread.upvotes + 1 : thread.upvotes,
          downvotes: !isUpvote ? thread.downvotes + 1 : thread.downvotes,
        };
      }
      return thread;
    }));
  };

  const getSortedThreads = () => {
    let filtered = selectedCategory === 'all'
      ? threads
      : threads.filter(t => t.category === selectedCategory);

    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortBy) {
        case 'hot':
          const aScore = a.upvotes - a.downvotes + a.commentCount * 2;
          const bScore = b.upvotes - b.downvotes + b.commentCount * 2;
          return bScore - aScore;
        case 'new':
          return b.createdAt - a.createdAt;
        case 'top':
          return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading':
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'cards':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'general':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'help':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trading':
        return <TrendingUp className="w-3 h-3" />;
      case 'cards':
        return <Tag className="w-3 h-3" />;
      case 'general':
        return <MessageSquare className="w-3 h-3" />;
      case 'help':
        return <MessageCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <Head>
        <title>Community Forum - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen">
        <MobileNav />

        {/* Header */}
        <header className="hidden lg:block border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Community Forum</span>
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
          {/* Search and Create */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 justify-center whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Create Thread
            </button>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6 sticky top-24">
                {/* Sort By */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">SORT BY</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'hot', label: 'Hot', icon: Flame },
                      { value: 'new', label: 'New', icon: Clock },
                      { value: 'top', label: 'Top', icon: Trophy },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value as any)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                          sortBy === value
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">CATEGORIES</h3>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Topics' },
                      { value: 'trading', label: 'Trading' },
                      { value: 'cards', label: 'Cards' },
                      { value: 'general', label: 'General' },
                      { value: 'help', label: 'Help' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setSelectedCategory(value as any)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === value
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Threads List */}
            <div className="lg:col-span-3 space-y-4">
              {getSortedThreads().map(thread => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6 hover:bg-white/90 dark:hover:bg-white/10 transition cursor-pointer"
                  onClick={() => router.push(`/forum/${thread.id}`)}
                >
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(thread.id, true);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
                      >
                        <ThumbsUp className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-green-500" />
                      </button>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {thread.upvotes - thread.downvotes}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(thread.id, false);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
                      >
                        <ThumbsDown className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {thread.isPinned && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded">
                            PINNED
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getCategoryColor(thread.category)}`}>
                          {getCategoryIcon(thread.category)}
                          {thread.category.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-purple-500 dark:hover:text-purple-400 transition">
                        {thread.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {thread.content}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-mono">{thread.author}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(thread.createdAt)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{thread.commentCount} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {getSortedThreads().length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No threads found matching your search' : 'No threads in this category'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Thread Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                onClick={() => setShowCreateModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-2xl shadow-2xl z-[101] p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Thread</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['trading', 'cards', 'general', 'help'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewThreadCategory(cat as any)}
                          className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                            newThreadCategory === cat
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-white/20'
                          }`}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                      placeholder="Enter thread title..."
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Content
                    </label>
                    <textarea
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                      placeholder="Share your thoughts, questions, or insights..."
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleCreateThread}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Post Thread
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
