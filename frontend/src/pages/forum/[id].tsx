import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Send,
  CornerUpLeft,
  Tag,
  Clock,
} from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import MobileNav from '@/components/MobileNav';
import { useAccount } from 'wagmi';

interface Comment {
  id: number;
  author: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
  replies: Comment[];
}

interface Thread {
  id: number;
  title: string;
  content: string;
  author: string;
  category: 'trading' | 'cards' | 'general' | 'help';
  upvotes: number;
  downvotes: number;
  createdAt: number;
  isPinned: boolean;
}

const MOCK_THREAD: Thread = {
  id: 1,
  title: 'Best strategy for hedging Charizard positions?',
  content: 'I have a large LONG position on Charizard Base Set and want to hedge against potential downside. Should I buy protective puts or use a collar strategy? What strike prices would you recommend?\n\nCurrently holding 10 futures contracts at $95/card with expiration in 30 days. The current spot price is $98. I\'m concerned about a potential correction but don\'t want to close my position entirely.\n\nLooking for advice from experienced traders on the best hedging approach!',
  author: '0x1234...5678',
  category: 'trading',
  upvotes: 45,
  downvotes: 3,
  createdAt: Date.now() - 2 * 60 * 60 * 1000,
  isPinned: true,
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    author: '0xabcd...efgh',
    content: 'I\'d recommend a collar strategy. Buy puts at $90 strike and sell calls at $105 strike. This limits your upside but protects the downside with minimal net cost. The put premium will be partially offset by the call premium.',
    upvotes: 23,
    downvotes: 1,
    createdAt: Date.now() - 1 * 60 * 60 * 1000,
    replies: [
      {
        id: 2,
        author: '0x1234...5678',
        content: 'Thanks! What expiration would you suggest for the options? Same as my futures contract or longer?',
        upvotes: 5,
        downvotes: 0,
        createdAt: Date.now() - 50 * 60 * 1000,
        replies: [
          {
            id: 3,
            author: '0xabcd...efgh',
            content: 'Match the expiration with your futures. This way your hedge expires at the same time as your position, keeping things simple.',
            upvotes: 12,
            downvotes: 0,
            createdAt: Date.now() - 45 * 60 * 1000,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 4,
    author: '0x9999...8888',
    content: 'Another option is to use a put spread instead of buying puts outright. Buy $90 puts and sell $80 puts. This reduces your cost significantly while still giving you good protection in the $90-$98 range.',
    upvotes: 18,
    downvotes: 2,
    createdAt: Date.now() - 90 * 60 * 1000,
    replies: [],
  },
  {
    id: 5,
    author: '0x5555...6666',
    content: 'Have you considered just reducing your position size instead of hedging? Sometimes the simplest approach is best. You could close 50% of your position and keep the other half for upside exposure.',
    upvotes: 8,
    downvotes: 5,
    createdAt: Date.now() - 80 * 60 * 1000,
    replies: [
      {
        id: 6,
        author: '0x7777...3333',
        content: 'I disagree. Hedging allows you to maintain your full position while managing risk. Reducing position size means giving up potential profits if the price continues to rise.',
        upvotes: 15,
        downvotes: 2,
        createdAt: Date.now() - 70 * 60 * 1000,
        replies: [],
      },
    ],
  },
];

export default function ThreadPage() {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useAccount();

  const [thread] = useState<Thread>(MOCK_THREAD);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleVoteThread = (isUpvote: boolean) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }
    // In a real app, this would update the backend
    alert(`Voted ${isUpvote ? 'UP' : 'DOWN'} on thread`);
  };

  const handleVoteComment = (commentId: number, isUpvote: boolean) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }

    const updateCommentVotes = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            upvotes: isUpvote ? comment.upvotes + 1 : comment.upvotes,
            downvotes: !isUpvote ? comment.downvotes + 1 : comment.downvotes,
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentVotes(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(updateCommentVotes(comments));
  };

  const handlePostComment = () => {
    if (!isConnected) {
      alert('Please connect your wallet to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const comment: Comment = {
      id: Date.now(),
      author: address || '0x0000...0000',
      content: newComment,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
      replies: [],
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const handlePostReply = (parentId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to reply');
      return;
    }

    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    const reply: Comment = {
      id: Date.now(),
      author: address || '0x0000...0000',
      content: replyContent,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
      replies: [],
    };

    const addReply = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, reply],
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReply(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(addReply(comments));
    setReplyingTo(null);
    setReplyContent('');
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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

  const renderComment = (comment: Comment, depth: number = 0) => {
    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4' : 'mb-6'}>
        <div className="bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg p-4">
          <div className="flex gap-3">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleVoteComment(comment.id, true)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
              >
                <ThumbsUp className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-green-500" />
              </button>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {comment.upvotes - comment.downvotes}
              </div>
              <button
                onClick={() => handleVoteComment(comment.id, false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
              >
                <ThumbsDown className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300 font-semibold">
                  {comment.author}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>

              <p className="text-gray-900 dark:text-white whitespace-pre-wrap mb-3">
                {comment.content}
              </p>

              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-sm text-purple-500 hover:text-purple-600 font-semibold flex items-center gap-1"
              >
                <CornerUpLeft className="w-4 h-4" />
                Reply
              </button>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePostReply(comment.id)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition"
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-300 dark:hover:bg-white/20 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{thread.title} - Forum - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen">
        <MobileNav />

        {/* Header */}
        <header className="hidden lg:block border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/forum')}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Thread</span>
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

        <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0 max-w-5xl">
          {/* Thread */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8 mb-6"
          >
            <div className="flex gap-6">
              {/* Vote Section */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleVoteThread(true)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
                >
                  <ThumbsUp className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-green-500" />
                </button>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {thread.upvotes - thread.downvotes}
                </div>
                <button
                  onClick={() => handleVoteThread(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
                >
                  <ThumbsDown className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-4">
                  {thread.isPinned && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold rounded">
                      PINNED
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${getCategoryColor(thread.category)}`}>
                    <Tag className="w-3 h-3" />
                    {thread.category.toUpperCase()}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {thread.title}
                </h1>

                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-500 mb-6">
                  <span className="font-mono">{thread.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(thread.createdAt)}
                  </div>
                </div>

                <p className="text-gray-900 dark:text-white text-lg whitespace-pre-wrap leading-relaxed">
                  {thread.content}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Comment Input */}
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add a Comment</h3>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-3"
            />
            <button
              onClick={handlePostComment}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Post Comment
            </button>
          </div>

          {/* Comments */}
          <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Comments ({comments.length})
            </h3>
            <div>
              {comments.map(comment => renderComment(comment))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
