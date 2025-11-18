import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Zap,
  ArrowLeft,
  BookOpen,
  DollarSign,
  Target,
  Coins,
  BarChart3,
  Users,
  MessageSquare,
  Vote,
  Brain,
  Droplet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import MobileNav from '@/components/MobileNav';

interface FAQItem {
  question: string;
  answer: string;
}

export default function LearnPage() {
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'What are TCG derivatives and why would I trade them?',
      answer: 'TCG derivatives are financial contracts based on the price of Trading Card Game cards (like Pokemon, Magic: The Gathering). They allow you to profit from price movements without owning the physical cards, hedge your card collection against price drops, and gain leveraged exposure to the market. This is perfect for collectors, investors, and traders who want more sophisticated ways to manage risk and maximize returns.',
    },
    {
      question: 'How does the platform ensure fair pricing?',
      answer: 'Our platform uses decentralized price oracles that aggregate data from multiple sources including TCGPlayer, eBay sold listings, and other major marketplaces. Prices are updated in real-time and verified through blockchain technology to prevent manipulation. The order matching engine uses a transparent algorithm to ensure fair execution for all traders.',
    },
    {
      question: 'What happens if I can\'t fulfill my futures contract?',
      answer: 'All futures contracts require collateral (typically 20% of the contract value) posted upfront. If your position moves against you and approaches the liquidation threshold, you\'ll receive notifications to add more collateral or close the position. If liquidation occurs, your collateral is used to settle the contract and any remaining funds are returned to you.',
    },
    {
      question: 'Can I trade 24/7?',
      answer: 'Yes! Unlike traditional card shops and marketplaces, our platform operates 24/7/365. You can open, close, and manage positions at any time. The decentralized nature of the platform means there are no trading hours or maintenance windows.',
    },
    {
      question: 'How do I get started?',
      answer: 'Simply connect your Web3 wallet (MetaMask, Rainbow, etc.), complete the risk tolerance survey to help our AI assistant provide personalized recommendations, and you\'re ready to trade! We recommend starting with the Risk Calculator to understand position sizing and the Learn section to understand each derivative type.',
    },
  ];

  return (
    <>
      <Head>
        <title>Learn - TCG Derivatives Platform</title>
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
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Learn</span>
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

        <div className="container mx-auto px-4 py-12 mt-16 lg:mt-0">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Master TCG Derivatives Trading
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300">
              Everything you need to know about trading card derivatives, from basics to advanced strategies.
            </p>
          </div>

          {/* Derivative Types */}
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Derivative Types
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Futures */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Futures</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Lock in a price today for a transaction in the future. Perfect for hedging or speculating on price movements.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Use Case</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Protect against price drops or profit from expected price increases
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Collateral</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        20% of contract value required upfront
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Risk Level</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        High - Unlimited downside potential
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Options</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Buy the right (not obligation) to trade at a specific price. Limited risk with unlimited upside.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Use Case</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Insurance for collections or leveraged bets with defined risk
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Premium</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Pay upfront premium (typically 5-15% of card value)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Risk Level</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Medium - Maximum loss is premium paid
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Swaps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Swaps</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Exchange cash flows based on two card prices. Perfect for relative value trading and hedging.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Use Case</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Hedge one card position against another's performance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Settlement</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Net settlement - only pay/receive the difference
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Risk Level</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Medium - Depends on price correlation
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Platform Features */}
          <div className="max-w-6xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Platform Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: 'AI Trading Assistant',
                  description: 'Get personalized trading recommendations based on your risk tolerance, portfolio, and market conditions. The AI analyzes real-time data to suggest optimal strategies.',
                  color: 'purple',
                },
                {
                  icon: Droplet,
                  title: 'Liquidity Pools',
                  description: 'Provide liquidity and earn fees from trades. LP tokens represent your share, and you earn a portion of all platform trading fees.',
                  color: 'blue',
                },
                {
                  icon: BarChart3,
                  title: 'Advanced Analytics',
                  description: 'Track your performance with detailed analytics. View profit/loss, win rate, best performing strategies, and compare against other traders.',
                  color: 'green',
                },
                {
                  icon: Vote,
                  title: 'DAO Governance',
                  description: 'Vote on platform decisions including fee structures, new card listings, and feature implementations. Your governance tokens give you voting power.',
                  color: 'orange',
                },
                {
                  icon: MessageSquare,
                  title: 'Community Forum',
                  description: 'Discuss strategies, share insights, and learn from other traders. Upvote valuable content and build your reputation in the community.',
                  color: 'pink',
                },
                {
                  icon: Target,
                  title: 'Risk Calculator',
                  description: 'Calculate potential profits, losses, and optimal position sizes before entering trades. Understand your risk exposure for every strategy.',
                  color: 'red',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6"
                >
                  <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-500`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              How It Works
            </h2>
            <div className="space-y-6">
              {[
                {
                  step: 1,
                  title: 'Connect Your Wallet',
                  description: 'Use MetaMask, Rainbow, or any Web3 wallet to connect. Your wallet is your identity and holds your funds securely.',
                },
                {
                  step: 2,
                  title: 'Complete Risk Survey',
                  description: 'Answer a few questions about your trading experience and risk tolerance. This helps our AI provide personalized recommendations.',
                },
                {
                  step: 3,
                  title: 'Choose Your Strategy',
                  description: 'Select the derivative type (Futures, Options, or Swaps) and the card you want to trade. Use our AI assistant for guidance.',
                },
                {
                  step: 4,
                  title: 'Set Your Parameters',
                  description: 'Choose position size, strike prices, expiration dates, and order type. The Risk Calculator shows potential outcomes.',
                },
                {
                  step: 5,
                  title: 'Execute & Monitor',
                  description: 'Submit your order to the blockchain. Monitor your positions in real-time and receive AI alerts about market changes.',
                },
                {
                  step: 6,
                  title: 'Settle or Close',
                  description: 'Close positions early for profit/loss or wait for expiration. All settlements are handled automatically via smart contracts.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl p-6 flex gap-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-white/5 transition"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-4xl mx-auto mt-20 text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
                Join thousands of traders maximizing their TCG investments with derivatives
              </p>
              <button
                onClick={() => router.push('/trade')}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold text-lg hover:opacity-90 transition"
              >
                Start Trading Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
