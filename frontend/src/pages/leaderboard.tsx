import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import Leaderboard from '@/components/Leaderboard';
import MobileNav from '@/components/MobileNav';

export default function LeaderboardPage() {
  return (
    <>
      <Head>
        <title>Leaderboard - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen pb-24 lg:pb-8">
        <MobileNav />

        {/* Desktop Header */}
        <header className="hidden lg:block border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/">
                <button className="p-2 hover:bg-white/10 rounded-lg transition">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </Link>
              <WalletButton />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
          <Leaderboard />
        </div>
      </div>
    </>
  );
}
