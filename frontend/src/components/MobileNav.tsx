import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  TrendingUp,
  BarChart3,
  Trophy,
  Award,
  Menu,
  X,
  Wallet,
  Settings,
  HelpCircle,
  Calculator,
  History,
  DollarSign,
  Droplet,
  Vote,
  MessageSquare,
  Target,
} from 'lucide-react';
import WalletButton from './WalletButton';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/trade', label: 'Trade', icon: TrendingUp },
    { href: '/forum', label: 'Forum', icon: MessageSquare },
    { href: '/liquidity', label: 'Liquidity', icon: Droplet },
    { href: '/governance', label: 'Governance', icon: Vote },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">TCG</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-white/10 z-50 overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Close Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Wallet Connection */}
                <div>
                  <WalletButton />
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.href} href={item.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 p-4 rounded-xl transition ${
                            isActive(item.href)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-semibold">{item.label}</span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </nav>

                {/* Additional Actions */}
                <div className="pt-6 border-t border-white/10 space-y-2">
                  <Link href="/risk-survey">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition"
                    >
                      <Target className="w-5 h-5" />
                      <span className="font-semibold">Risk Survey</span>
                    </button>
                  </Link>
                  <Link href="/risk-calculator">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition"
                    >
                      <Calculator className="w-5 h-5" />
                      <span className="font-semibold">Risk Calculator</span>
                    </button>
                  </Link>
                  <Link href="/transaction-history">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition"
                    >
                      <History className="w-5 h-5" />
                      <span className="font-semibold">Transaction History</span>
                    </button>
                  </Link>
                  <Link href="/card-prices">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition"
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="font-semibold">Card Prices</span>
                    </button>
                  </Link>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition">
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition">
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-semibold">Help & Support</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-white/10">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                    isActive(item.href)
                      ? 'text-purple-400 bg-purple-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="lg:hidden h-20"></div>
    </>
  );
}
