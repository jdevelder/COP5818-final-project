import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Droplet } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import LiquidityPool from '@/components/LiquidityPool';
import OrderBook from '@/components/OrderBook';
import MobileNav from '@/components/MobileNav';

export default function LiquidityPage() {
  return (
    <>
      <Head>
        <title>Liquidity Pool - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen pb-24 lg:pb-8">
        <MobileNav />

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-gray-300 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                  </button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Droplet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Liquidity Pool</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Provide liquidity and earn fees</p>
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
          <div className="space-y-8">
            <LiquidityPool />

            {/* Order Matching Engine */}
            <div className="pt-8 border-t border-gray-300 dark:border-white/10">
              <OrderBook />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
