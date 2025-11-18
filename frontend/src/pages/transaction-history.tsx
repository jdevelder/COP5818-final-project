import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import { useAccount } from 'wagmi';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import TransactionHistory from '@/components/TransactionHistory';
import MobileNav from '@/components/MobileNav';

export default function TransactionHistoryPage() {
  const { isConnected } = useAccount();

  return (
    <>
      <Head>
        <title>Transaction History - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen pb-24 lg:pb-8">
        <MobileNav />

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-white/10 light:border-gray-300 backdrop-blur-md bg-white/5 light:bg-white/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="p-2 hover:bg-white/10 light:hover:bg-gray-200 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-white light:text-gray-900" />
                  </button>
                </Link>
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-purple-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-white light:text-gray-900">Transaction History</h1>
                    <p className="text-gray-400 light:text-gray-600 text-sm">View and export your trading history</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <WalletButton />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
          {!isConnected ? (
            <div className="max-w-md mx-auto mt-20 text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white light:text-gray-900 mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-gray-400 light:text-gray-600 mb-6">
                Please connect your wallet to view your transaction history
              </p>
              <WalletButton />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Info Banner */}
              <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 light:from-purple-200 light:to-pink-200 border border-purple-500/30 light:border-purple-300">
                <h2 className="text-xl font-bold text-white light:text-gray-900 mb-2">Export Your Trading History</h2>
                <p className="text-gray-300 light:text-gray-700">
                  Download your complete trading history in CSV or PDF format for accounting, tax purposes, or personal records.
                  All transactions are pulled directly from the blockchain for accuracy.
                </p>
              </div>

              {/* Transaction History Component */}
              <TransactionHistory />

              {/* Tax Info Section */}
              <div className="mt-8 p-6 rounded-xl bg-yellow-500/10 light:bg-yellow-100 border border-yellow-500/30 light:border-yellow-300">
                <h3 className="text-lg font-bold text-yellow-400 light:text-yellow-700 mb-2">Tax Reporting</h3>
                <p className="text-sm text-yellow-300 light:text-yellow-800 mb-3">
                  Cryptocurrency derivatives trading may have tax implications in your jurisdiction. We recommend:
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-300 light:text-yellow-800 space-y-1">
                  <li>Consulting with a tax professional familiar with cryptocurrency trading</li>
                  <li>Keeping detailed records of all your transactions</li>
                  <li>Reporting all gains and losses accurately</li>
                  <li>Being aware of your local tax laws regarding digital assets</li>
                </ul>
                <p className="text-xs text-yellow-300 light:text-yellow-800 mt-3">
                  <strong>Disclaimer:</strong> This platform does not provide tax advice. The export feature is provided for your convenience only.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
