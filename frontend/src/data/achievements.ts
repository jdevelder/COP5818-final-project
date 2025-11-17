import { Trophy, Target, Zap, Crown, Star, Award, Flame, TrendingUp } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: number;
  reward: number; // XP points
  category: 'trading' | 'profit' | 'volume' | 'social';
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_trade',
    name: 'First Steps',
    description: 'Open your first position',
    icon: Target,
    rarity: 'common',
    requirement: 1,
    reward: 100,
    category: 'trading',
  },
  {
    id: 'trader_10',
    name: 'Active Trader',
    description: 'Complete 10 trades',
    icon: TrendingUp,
    rarity: 'common',
    requirement: 10,
    reward: 250,
    category: 'trading',
  },
  {
    id: 'trader_50',
    name: 'Veteran Trader',
    description: 'Complete 50 trades',
    icon: Award,
    rarity: 'rare',
    requirement: 50,
    reward: 500,
    category: 'trading',
  },
  {
    id: 'trader_100',
    name: 'Master Trader',
    description: 'Complete 100 trades',
    icon: Crown,
    rarity: 'epic',
    requirement: 100,
    reward: 1000,
    category: 'trading',
  },
  {
    id: 'profit_1000',
    name: 'Profitable Start',
    description: 'Earn $1,000 in total profit',
    icon: Star,
    rarity: 'common',
    requirement: 1000,
    reward: 300,
    category: 'profit',
  },
  {
    id: 'profit_10000',
    name: 'Big Winner',
    description: 'Earn $10,000 in total profit',
    icon: Trophy,
    rarity: 'rare',
    requirement: 10000,
    reward: 750,
    category: 'profit',
  },
  {
    id: 'profit_100000',
    name: 'Whale Status',
    description: 'Earn $100,000 in total profit',
    icon: Crown,
    rarity: 'legendary',
    requirement: 100000,
    reward: 2500,
    category: 'profit',
  },
  {
    id: 'streak_7',
    name: 'Lucky Streak',
    description: 'Win 7 trades in a row',
    icon: Flame,
    rarity: 'rare',
    requirement: 7,
    reward: 600,
    category: 'trading',
  },
  {
    id: 'volume_100k',
    name: 'Volume Trader',
    description: 'Trade $100k total volume',
    icon: Zap,
    rarity: 'epic',
    requirement: 100000,
    reward: 1500,
    category: 'volume',
  },
  {
    id: 'all_types',
    name: 'Derivatives Master',
    description: 'Trade all three derivative types',
    icon: Award,
    rarity: 'rare',
    requirement: 3,
    reward: 500,
    category: 'trading',
  },
];

export const RARITY_STYLES = {
  common: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/50',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/50',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/50',
  },
  legendary: {
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/50',
  },
};

export function calculateLevel(xp: number): { level: number; currentXP: number; nextLevelXP: number } {
  // Level formula: level = floor(sqrt(xp / 100))
  const level = Math.floor(Math.sqrt(xp / 100));
  const currentLevelXP = level * level * 100;
  const nextLevelXP = (level + 1) * (level + 1) * 100;
  const currentXP = xp - currentLevelXP;

  return {
    level: level + 1, // Start from level 1
    currentXP,
    nextLevelXP: nextLevelXP - currentLevelXP,
  };
}

export function checkAchievements(userStats: any): string[] {
  const unlockedAchievements: string[] = [];

  ACHIEVEMENTS.forEach(achievement => {
    let isUnlocked = false;

    switch (achievement.category) {
      case 'trading':
        if (achievement.id === 'first_trade' && userStats.totalTrades >= 1) isUnlocked = true;
        if (achievement.id === 'trader_10' && userStats.totalTrades >= 10) isUnlocked = true;
        if (achievement.id === 'trader_50' && userStats.totalTrades >= 50) isUnlocked = true;
        if (achievement.id === 'trader_100' && userStats.totalTrades >= 100) isUnlocked = true;
        if (achievement.id === 'streak_7' && userStats.winStreak >= 7) isUnlocked = true;
        if (achievement.id === 'all_types' && userStats.tradedTypes >= 3) isUnlocked = true;
        break;

      case 'profit':
        if (achievement.id === 'profit_1000' && userStats.totalProfit >= 1000) isUnlocked = true;
        if (achievement.id === 'profit_10000' && userStats.totalProfit >= 10000) isUnlocked = true;
        if (achievement.id === 'profit_100000' && userStats.totalProfit >= 100000) isUnlocked = true;
        break;

      case 'volume':
        if (achievement.id === 'volume_100k' && userStats.totalVolume >= 100000) isUnlocked = true;
        break;
    }

    if (isUnlocked) {
      unlockedAchievements.push(achievement.id);
    }
  });

  return unlockedAchievements;
}
