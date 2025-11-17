import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS, RARITY_STYLES, calculateLevel, Achievement } from '@/data/achievements';
import { Trophy, Lock, Star, ChevronRight } from 'lucide-react';

interface AchievementsPanelProps {
  userXP?: number;
  unlockedAchievements?: string[];
}

export default function AchievementsPanel({ userXP = 0, unlockedAchievements = [] }: AchievementsPanelProps) {
  const { level, currentXP, nextLevelXP } = calculateLevel(userXP);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'trading', label: 'Trading' },
    { id: 'profit', label: 'Profit' },
    { id: 'volume', label: 'Volume' },
  ];

  const filteredAchievements = ACHIEVEMENTS.filter(
    achievement =>
      (selectedCategory === 'all' || achievement.category === selectedCategory) &&
      (!showUnlockedOnly || unlockedAchievements.includes(achievement.id))
  );

  const progress = (currentXP / nextLevelXP) * 100;
  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <div className="space-y-6">
      {/* Level & XP Display */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">Your Level</p>
            <p className="text-4xl font-bold text-white">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Total XP</p>
            <p className="text-2xl font-bold text-purple-400">{userXP.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{currentXP} XP</span>
            <span>{nextLevelXP} XP to Level {level + 1}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Unlocked</p>
          <p className="text-2xl font-bold text-white">
            {totalUnlocked}/{totalAchievements}
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Completion</p>
          <p className="text-2xl font-bold text-white">{((totalUnlocked / totalAchievements) * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            showUnlockedOnly
              ? 'bg-green-500 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          {showUnlockedOnly ? 'Show All' : 'Unlocked Only'}
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            const styles = RARITY_STYLES[achievement.rarity];
            const Icon = achievement.icon;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-white/5 backdrop-blur-md border ${
                  isUnlocked ? styles.border : 'border-white/10'
                } rounded-xl p-4 ${isUnlocked ? `shadow-lg ${styles.glow}` : ''} transition-all hover:scale-102`}
              >
                {/* Rarity Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text}`}>
                  {achievement.rarity.toUpperCase()}
                </div>

                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                      isUnlocked ? styles.bg : 'bg-white/10'
                    } ${isUnlocked ? '' : 'grayscale'}`}
                  >
                    {isUnlocked ? (
                      <Icon className={`w-8 h-8 ${styles.text}`} />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h4 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-sm mb-2 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-semibold">+{achievement.reward} XP</span>
                    </div>
                  </div>
                </div>

                {/* Unlocked Overlay */}
                {isUnlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2"
                  >
                    <Trophy className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No achievements found</p>
        </div>
      )}
    </div>
  );
}

// Achievement Notification Toast
export function AchievementUnlockedToast({ achievement }: { achievement: Achievement }) {
  const styles = RARITY_STYLES[achievement.rarity];
  const Icon = achievement.icon;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className={`bg-slate-900 border-2 ${styles.border} rounded-xl p-4 shadow-2xl ${styles.glow} max-w-sm`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${styles.bg}`}>
          <Icon className={`w-6 h-6 ${styles.text}`} />
        </div>
        <div>
          <p className="text-white font-bold">Achievement Unlocked!</p>
          <p className={`text-sm ${styles.text}`}>{achievement.rarity.toUpperCase()}</p>
        </div>
      </div>
      <h4 className="text-white font-bold mb-1">{achievement.name}</h4>
      <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="text-yellow-400 text-sm font-semibold">+{achievement.reward} XP</span>
      </div>
    </motion.div>
  );
}
