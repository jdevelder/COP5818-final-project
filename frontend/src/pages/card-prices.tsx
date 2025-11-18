import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, DollarSign } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import CardPriceSearch from '@/components/CardPriceSearch';
import MobileNav from '@/components/MobileNav';

export default function CardPricesPage() {
  return (
    <>
      <Head>
        <title>Card Price Search - TCG Derivatives</title>
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
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Card Price Search</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Real-time prices from eBay marketplace</p>
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
          <div className="max-w-7xl mx-auto">
            {/* Info Banner */}
            <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-500/20 dark:to-emerald-500/20 border border-green-500/30 dark:border-green-500/30">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Real-Time Card Pricing
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Get instant access to current market prices for TCG cards from eBay's marketplace.
                Search for any card to see recent sold listings and average prices.
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <li>Live pricing data from eBay</li>
                <li>Compare prices across multiple listings</li>
                <li>View average market price</li>
                <li>Check condition and seller ratings</li>
              </ul>
            </div>

            {/* Card Price Search Component */}
            <CardPriceSearch />

            {/* Tips Section */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/70 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Search Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Include card name, set, and rarity for best results</li>
                  <li>• Try variations like "Base Set" or "1st Edition"</li>
                  <li>• Check multiple spellings if results are limited</li>
                  <li>• Use quotes for exact phrase matching</li>
                  <li>• Add "PSA" or "BGS" to find graded cards</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-white/70 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Price Factors</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• <strong>Condition:</strong> Near Mint > Lightly Played > Moderately Played</li>
                  <li>• <strong>Grading:</strong> PSA 10 commands premium prices</li>
                  <li>• <strong>Edition:</strong> 1st Edition often worth more</li>
                  <li>• <strong>Set:</strong> Earlier sets generally more valuable</li>
                  <li>• <strong>Rarity:</strong> Holographic and rare cards worth more</li>
                </ul>
              </div>
            </div>

            {/* API Status Notice */}
            <div className="mt-8 p-6 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-500/30">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-2">
                💡 eBay API Status
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                Your eBay API is configured and working! However, you may see sample data due to:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li><strong>Rate Limits:</strong> eBay limits API calls per day (typically 5,000 for production keys)</li>
                <li><strong>Automatic Fallback:</strong> When limits are reached, sample data is shown automatically</li>
                <li><strong>Resets Daily:</strong> Your API quota resets every 24 hours</li>
              </ul>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-3">
                <strong>Tip:</strong> To reduce API calls, we'll implement caching in the next update. For now, the system gracefully falls back to sample data when needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
