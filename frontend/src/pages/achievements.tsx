import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import ThemeToggle from '@/components/ThemeToggle';
import AchievementsPanel from '@/components/AchievementsPanel';
import MobileNav from '@/components/MobileNav';

export default function AchievementsPage() {
  // Mock data - in production, fetch from backend/blockchain
  const userXP = 5000;
  const unlockedAchievements = ['first_trade', 'trader_10', 'profit_1000'];

  return (
    <>
      <Head>
        <title>Achievements - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen pb-24 lg:pb-8">
        <MobileNav />

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white">Achievements</h1>
                  <p className="text-gray-400 text-sm">Track your progress and earn rewards</p>
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
          <AchievementsPanel userXP={userXP} unlockedAchievements={unlockedAchievements} />
        </div>
      </div>
    </>
  );
}
