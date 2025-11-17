import React, { useState } from 'react';
import { getCardData, RARITY_COLORS, GAME_COLORS, CardData } from '@/data/cardDatabase';
import { Sparkles, TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardDisplayProps {
  cardId: string;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function CardDisplay({
  cardId,
  size = 'medium',
  showDetails = false,
  onClick,
  className = '',
}: CardDisplayProps) {
  const cardData = getCardData(cardId);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!cardData) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-gray-400">Card not found: {cardId}</p>
      </div>
    );
  }

  const sizeClasses = {
    small: 'w-32 h-44',
    medium: 'w-48 h-64',
    large: 'w-64 h-96',
  };

  const rarityInfo = RARITY_COLORS[cardData.rarity];
  const gameColors = GAME_COLORS[cardData.game];

  // Calculate price trend
  const priceChange = cardData.priceHistory.length > 1
    ? ((cardData.priceHistory[cardData.priceHistory.length - 1] - cardData.priceHistory[0]) / cardData.priceHistory[0]) * 100
    : 0;
  const isPositiveTrend = priceChange >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group cursor-pointer ${className}`}
    >
      {/* Card Container */}
      <div className={`${sizeClasses[size]} relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${
        rarityInfo ? `border-${rarityInfo.text.split('-')[1]}-500/50` : 'border-white/10'
      } shadow-lg group-hover:shadow-2xl transition-all duration-300`}>

        {/* Rarity Glow Effect */}
        <div className={`absolute inset-0 opacity-20 blur-xl ${rarityInfo?.bg}`}></div>

        {/* Card Image */}
        <div className="relative h-full w-full">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <Sparkles className="w-12 h-12 text-gray-600 mb-2" />
              <p className="text-white font-bold text-lg">{cardData.name}</p>
              <p className="text-gray-400 text-sm">{cardData.set}</p>
            </div>
          ) : (
            <img
              src={cardData.imageUrl}
              alt={cardData.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Rarity Badge */}
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full backdrop-blur-md ${rarityInfo?.bg} ${rarityInfo?.text} text-xs font-bold border border-white/20 flex items-center gap-1`}>
            <Sparkles className="w-3 h-3" />
            {rarityInfo?.label}
          </div>

          {/* Game Badge */}
          <div
            className="absolute top-2 left-2 px-3 py-1 rounded-full backdrop-blur-md bg-black/50 text-white text-xs font-bold border border-white/20"
            style={{
              borderColor: gameColors.primary,
            }}
          >
            {cardData.game}
          </div>

          {/* Hover Overlay with Details */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end"
            >
              <h3 className="text-white font-bold text-lg mb-1">{cardData.name}</h3>
              <p className="text-gray-300 text-sm mb-3">{cardData.set}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white font-semibold">${cardData.averagePrice}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">24h Change</span>
                  <span className={`font-semibold flex items-center gap-1 ${
                    isPositiveTrend ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isPositiveTrend ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>

                {cardData.holders && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Holders</span>
                    <span className="text-white font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {cardData.holders}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>

      {/* Card Name Below (for small size) */}
      {size === 'small' && (
        <div className="mt-2 text-center">
          <p className="text-white font-semibold text-sm truncate">{cardData.name}</p>
          <p className="text-gray-400 text-xs">${cardData.averagePrice}</p>
        </div>
      )}
    </motion.div>
  );
}

// Card Grid Component
interface CardGridProps {
  cardIds: string[];
  onCardClick?: (cardId: string) => void;
}

export function CardGrid({ cardIds, onCardClick }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cardIds.map((cardId) => (
        <CardDisplay
          key={cardId}
          cardId={cardId}
          size="small"
          showDetails
          onClick={() => onCardClick?.(cardId)}
        />
      ))}
    </div>
  );
}

// Card Detail Modal
interface CardDetailModalProps {
  cardId: string;
  onClose: () => void;
}

export function CardDetailModal({ cardId, onClose }: CardDetailModalProps) {
  const cardData = getCardData(cardId);

  if (!cardData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Card Image */}
          <div>
            <CardDisplay cardId={cardId} size="large" />
          </div>

          {/* Right: Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{cardData.name}</h2>
              <p className="text-gray-400">{cardData.set}</p>
            </div>

            <p className="text-gray-300">{cardData.description}</p>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-400">Current Price</span>
                <span className="text-2xl font-bold text-white">${cardData.averagePrice}</span>
              </div>

              {cardData.marketCap && (
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Market Cap</span>
                  <span className="text-white font-semibold">${cardData.marketCap.toLocaleString()}</span>
                </div>
              )}

              {cardData.volume24h && (
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">24h Volume</span>
                  <span className="text-white font-semibold">${cardData.volume24h.toLocaleString()}</span>
                </div>
              )}

              {cardData.holders && (
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Holders</span>
                  <span className="text-white font-semibold">{cardData.holders}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
