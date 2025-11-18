import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import RiskCalculator from '@/components/RiskCalculator';
import MobileNav from '@/components/MobileNav';

export default function RiskCalculatorPage() {
  return (
    <>
      <Head>
        <title>Risk Calculator - TCG Derivatives</title>
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
                  <Calculator className="w-6 h-6 text-purple-400" />
                  <div>
                    <h1 className="text-2xl font-bold text-white light:text-gray-900">Risk Calculator</h1>
                    <p className="text-gray-400 light:text-gray-600 text-sm">Analyze position risk before trading</p>
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
          <div className="max-w-4xl mx-auto">
            {/* Info Banner */}
            <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 light:from-purple-200 light:to-pink-200 border border-purple-500/30 light:border-purple-300">
              <h2 className="text-xl font-bold text-white light:text-gray-900 mb-2">How to Use the Risk Calculator</h2>
              <p className="text-gray-300 light:text-gray-700 mb-4">
                This tool helps you analyze the risk and potential reward of a derivatives position before you enter it.
                Simply input your desired entry price, target price, and stop loss to see:
              </p>
              <ul className="list-disc list-inside text-gray-300 light:text-gray-700 space-y-1">
                <li>Potential profit and maximum loss</li>
                <li>Required collateral based on leverage</li>
                <li>Risk/reward ratio to evaluate trade quality</li>
                <li>Liquidation price for leveraged futures positions</li>
              </ul>
            </div>

            {/* Risk Calculator Component */}
            <RiskCalculator />

            {/* Tips Section */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white/5 light:bg-white/70 border border-white/10 light:border-gray-300">
                <h3 className="text-lg font-bold text-white light:text-gray-900 mb-3">Risk Management Tips</h3>
                <ul className="space-y-2 text-sm text-gray-300 light:text-gray-700">
                  <li>• Always use stop losses to limit potential losses</li>
                  <li>• Aim for risk/reward ratios of at least 1:2</li>
                  <li>• Never risk more than 2-5% of your portfolio on a single trade</li>
                  <li>• Be aware of liquidation prices on leveraged positions</li>
                  <li>• Consider market volatility when setting targets</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-white/5 light:bg-white/70 border border-white/10 light:border-gray-300">
                <h3 className="text-lg font-bold text-white light:text-gray-900 mb-3">Leverage Guidelines</h3>
                <ul className="space-y-2 text-sm text-gray-300 light:text-gray-700">
                  <li>• <strong>1-2x:</strong> Conservative, suitable for beginners</li>
                  <li>• <strong>3-5x:</strong> Moderate risk, most common for experienced traders</li>
                  <li>• <strong>6-10x:</strong> High risk, requires careful monitoring</li>
                  <li>• Higher leverage = closer liquidation price</li>
                  <li>• Start low and increase as you gain experience</li>
                </ul>
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-8 p-8 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Trade?</h3>
              <p className="text-white/90 mb-6">
                Use your risk analysis to make informed trading decisions on our platform
              </p>
              <Link href="/trade">
                <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Go to Trading Platform
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
