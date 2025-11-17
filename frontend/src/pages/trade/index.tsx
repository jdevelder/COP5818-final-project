import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, Shield, Zap, AlertCircle } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import CardDisplay from '@/components/CardDisplay';
import PriceChart from '@/components/PriceChart';
import PositionsList from '@/components/PositionsList';
import MobileNav from '@/components/MobileNav';
import { useAccount } from 'wagmi';
import { useFutures } from '@/hooks/useFutures';
import { useOptions } from '@/hooks/useOptions';
import { useSwaps } from '@/hooks/useSwaps';
import { usePriceOracle } from '@/hooks/usePriceOracle';
import { parseEther, formatEther } from 'viem';
import toast from 'react-hot-toast';

type DerivativeType = 'futures' | 'options' | 'swaps';
type PositionSide = 'LONG' | 'SHORT';
type OptionType = 'CALL' | 'PUT';

// Available cards (using only cards with working images)
const AVAILABLE_CARDS = [
  'Charizard-BaseSet-Rare',
  'BlackLotus-Alpha-Mythic',
  'PikachuEX-XY-Rare',
  'TimeWalk-Alpha-Rare',
  'Blastoise-BaseSet-Rare',
  'Venusaur-BaseSet-Rare'
];

export default function TradePage() {
  const [selectedType, setSelectedType] = useState<DerivativeType>('futures');
  const { address, isConnected } = useAccount();

  // Form states
  const [selectedCard, setSelectedCard] = useState(AVAILABLE_CARDS[0]);
  const [positionSide, setPositionSide] = useState<PositionSide>('LONG');
  const [optionType, setOptionType] = useState<OptionType>('CALL');
  const [strikePrice, setStrikePrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [duration, setDuration] = useState('7'); // days
  const [premium, setPremium] = useState('');

  // Swaps specific
  const [cardA, setCardA] = useState(AVAILABLE_CARDS[0]);
  const [cardB, setCardB] = useState(AVAILABLE_CARDS[1]);
  const [notionalA, setNotionalA] = useState('');
  const [notionalB, setNotionalB] = useState('');

  // Price data
  const [currentPrice, setCurrentPrice] = useState<bigint>(BigInt(0));

  // Position refresh trigger
  const [positionsKey, setPositionsKey] = useState(0);

  // Hooks
  const { openPosition: openFutures, loading: futuresLoading } = useFutures();
  const { createOption, loading: optionsLoading } = useOptions();
  const { proposeSwap, loading: swapsLoading } = useSwaps();
  const { getPrice } = usePriceOracle();

  // Load current price when card changes
  useEffect(() => {
    loadPrice();
  }, [selectedCard, cardA]);

  async function loadPrice() {
    try {
      const cardId = selectedType === 'swaps' ? cardA : selectedCard;
      const price = await getPrice(cardId);
      setCurrentPrice(price);

      // Auto-fill strike price with current price
      if (!strikePrice) {
        setStrikePrice(formatEther(price));
      }
    } catch (error) {
      console.error('Error loading price:', error);
    }
  }

  // Calculate collateral requirements
  const calculateCollateral = () => {
    if (!strikePrice || !quantity) return '0';

    try {
      const strike = parseEther(strikePrice);
      const qty = BigInt(quantity);

      switch (selectedType) {
        case 'futures':
          // 20% collateral
          return formatEther((strike * qty * 20n) / 100n);
        case 'options':
          // Premium only (calculated as ~10% of strike for simplicity)
          const premiumAmount = premium ? parseEther(premium) : (strike * qty * 10n) / 100n;
          return formatEther(premiumAmount);
        case 'swaps':
          // 15% of notional
          if (notionalA) {
            return formatEther((parseEther(notionalA) * 15n) / 100n);
          }
          return '0';
      }
    } catch {
      return '0';
    }
  };

  // Handle opening positions
  const handleOpenPosition = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      switch (selectedType) {
        case 'futures':
          if (!strikePrice || !quantity) {
            toast.error('Please fill in all fields');
            return;
          }
          await openFutures(
            selectedCard,
            positionSide === 'LONG' ? 0 : 1,
            strikePrice,
            parseInt(quantity),
            parseInt(duration)
          );
          break;

        case 'options':
          if (!strikePrice || !quantity || !premium) {
            toast.error('Please fill in all fields');
            return;
          }
          await createOption(
            selectedCard,
            optionType === 'CALL' ? 0 : 1,
            strikePrice,
            premium,
            parseInt(quantity),
            parseInt(duration)
          );
          break;

        case 'swaps':
          if (!notionalA || !notionalB) {
            toast.error('Please fill in all fields');
            return;
          }
          await proposeSwap(
            cardA,
            cardB,
            notionalA,
            notionalB,
            parseInt(duration)
          );
          break;
      }

      // Reset form
      setStrikePrice('');
      setQuantity('1');
      setPremium('');
      setNotionalA('');
      setNotionalB('');

      // Trigger positions refresh (silently, hooks already show success toast)
      setTimeout(() => {
        setPositionsKey(prev => prev + 1);
      }, 2000); // Wait 2 seconds for blockchain confirmation
    } catch (error) {
      console.error('Error opening position:', error);
    }
  };

  const isLoading = futuresLoading || optionsLoading || swapsLoading;

  return (
    <>
      <Head>
        <title>Trade Derivatives - TCG Platform</title>
      </Head>

      <div className="min-h-screen pb-24 lg:pb-8">
        <MobileNav />

        {/* Header */}
        <header className="hidden lg:block border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition">
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">TCG Derivatives</span>
                </div>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 mt-16 lg:mt-0">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Derivative Type Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-4">Derivative Type</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedType('futures')}
                    className={`w-full p-4 rounded-xl text-left transition flex items-center gap-3 ${
                      selectedType === 'futures'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Futures</div>
                      <div className="text-xs opacity-75">Lock in prices</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedType('options')}
                    className={`w-full p-4 rounded-xl text-left transition flex items-center gap-3 ${
                      selectedType === 'options'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Options</div>
                      <div className="text-xs opacity-75">Limited risk</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedType('swaps')}
                    className={`w-full p-4 rounded-xl text-left transition flex items-center gap-3 ${
                      selectedType === 'swaps'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Swaps</div>
                      <div className="text-xs opacity-75">Exchange flows</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Trading Area */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h1 className="text-3xl font-bold text-white capitalize mb-6">
                  {selectedType} Trading
                </h1>

                {/* Card Display & Price Chart */}
                {selectedType === 'swaps' ? (
                  // SWAPS: Show both cards side by side
                  <div className="space-y-6 mb-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Card A Preview */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Card A
                        </label>
                        <CardDisplay
                          cardId={cardA}
                          size="small"
                          showDetails={false}
                        />
                      </div>

                      {/* Card B Preview */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Card B
                        </label>
                        <CardDisplay
                          cardId={cardB}
                          size="small"
                          showDetails={false}
                        />
                      </div>
                    </div>

                    {/* Price Charts for both */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Card A Price History
                        </label>
                        <PriceChart cardId={cardA} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Card B Price History
                        </label>
                        <PriceChart cardId={cardB} />
                      </div>
                    </div>
                  </div>
                ) : (
                  // FUTURES & OPTIONS: Show single card and chart
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Card Preview */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Selected Card
                      </label>
                      <CardDisplay
                        cardId={selectedCard}
                        size="small"
                        showDetails={false}
                      />
                    </div>

                    {/* Price Chart */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Price History
                      </label>
                      <PriceChart
                        cardId={selectedCard}
                      />
                    </div>
                  </div>
                )}

                {/* FUTURES FORM */}
                {selectedType === 'futures' && (
                  <div className="space-y-6">
                    {/* Position Side */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Position Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPositionSide('LONG')}
                          className={`flex-1 py-3 rounded-lg font-semibold transition ${
                            positionSide === 'LONG'
                              ? 'bg-green-500 text-white'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          LONG (Buy)
                        </button>
                        <button
                          onClick={() => setPositionSide('SHORT')}
                          className={`flex-1 py-3 rounded-lg font-semibold transition ${
                            positionSide === 'SHORT'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          SHORT (Sell)
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Card Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Select Card
                        </label>
                        <select
                          value={selectedCard}
                          onChange={(e) => setSelectedCard(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ colorScheme: 'dark' }}
                        >
                          {AVAILABLE_CARDS.map(card => (
                            <option key={card} value={card} className="bg-gray-900 text-white">
                              {card.replace(/-/g, ' ')}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 text-sm text-gray-400">
                          Current Price: <span className="text-white font-semibold">
                            {currentPrice > 0 ? formatEther(currentPrice) : '0'} ETH
                          </span>
                        </div>
                      </div>

                      {/* Strike Price */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Strike Price (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={strikePrice}
                          onChange={(e) => setStrikePrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="1"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Duration (Days)
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="1" className="bg-gray-900">1 Day</option>
                          <option value="7" className="bg-gray-900">1 Week</option>
                          <option value="30" className="bg-gray-900">1 Month</option>
                          <option value="90" className="bg-gray-900">3 Months</option>
                          <option value="180" className="bg-gray-900">6 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTIONS FORM */}
                {selectedType === 'options' && (
                  <div className="space-y-6">
                    {/* Option Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Option Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setOptionType('CALL')}
                          className={`flex-1 py-3 rounded-lg font-semibold transition ${
                            optionType === 'CALL'
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          }`}
                        >
                          CALL (Right to Buy)
                        </button>
                        <button
                          onClick={() => setOptionType('PUT')}
                          className={`flex-1 py-3 rounded-lg font-semibold transition ${
                            optionType === 'PUT'
                              ? 'bg-orange-500 text-white'
                              : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                          }`}
                        >
                          PUT (Right to Sell)
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Card Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Select Card
                        </label>
                        <select
                          value={selectedCard}
                          onChange={(e) => setSelectedCard(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ colorScheme: 'dark' }}
                        >
                          {AVAILABLE_CARDS.map(card => (
                            <option key={card} value={card} className="bg-gray-900 text-white">
                              {card.replace(/-/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Strike Price */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Strike Price (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={strikePrice}
                          onChange={(e) => setStrikePrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Premium */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Premium (ETH)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={premium}
                          onChange={(e) => setPremium(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="mt-1 text-xs text-gray-400">
                          Premium you'll pay for this option
                        </div>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="1"
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Duration */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Duration (Days)
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="1" className="bg-gray-900">1 Day</option>
                          <option value="7" className="bg-gray-900">1 Week</option>
                          <option value="30" className="bg-gray-900">1 Month</option>
                          <option value="90" className="bg-gray-900">3 Months</option>
                          <option value="180" className="bg-gray-900">6 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* SWAPS FORM */}
                {selectedType === 'swaps' && (
                  <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-300">
                          Swaps allow you to exchange cash flows based on two card prices. Example: If Card A rises and Card B falls, you profit from the difference.
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Card A */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white">Card A (Your Position)</h3>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Select Card A
                          </label>
                          <select
                            value={cardA}
                            onChange={(e) => setCardA(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            style={{ colorScheme: 'dark' }}
                          >
                            {AVAILABLE_CARDS.map(card => (
                              <option key={card} value={card} className="bg-gray-900 text-white">
                                {card.replace(/-/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Notional Value A (ETH)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={notionalA}
                            onChange={(e) => setNotionalA(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      {/* Card B */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white">Card B (Counter Position)</h3>
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Select Card B
                          </label>
                          <select
                            value={cardB}
                            onChange={(e) => setCardB(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            style={{ colorScheme: 'dark' }}
                          >
                            {AVAILABLE_CARDS.map(card => (
                              <option key={card} value={card} className="bg-gray-900 text-white">
                                {card.replace(/-/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Notional Value B (ETH)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={notionalB}
                            onChange={(e) => setNotionalB(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                          Duration (Days)
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="1" className="bg-gray-900">1 Day</option>
                          <option value="7" className="bg-gray-900">1 Week</option>
                          <option value="30" className="bg-gray-900">1 Month</option>
                          <option value="90" className="bg-gray-900">3 Months</option>
                          <option value="180" className="bg-gray-900">6 Months</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Summary */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-6">
                  <h3 className="text-yellow-400 font-semibold mb-3">Risk Summary</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Required Collateral</div>
                      <div className="text-white font-semibold text-lg">
                        {calculateCollateral()} ETH
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Max Loss</div>
                      <div className="text-red-400 font-semibold text-lg">
                        {selectedType === 'options' ? calculateCollateral() + ' ETH (Premium)' : 'Unlimited'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Max Profit</div>
                      <div className="text-green-400 font-semibold text-lg">
                        {selectedType === 'options' || selectedType === 'futures' ? 'Unlimited' : 'Variable'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleOpenPosition}
                  disabled={!isConnected || isLoading}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isConnected ? 'Connect Wallet to Trade' :
                   isLoading ? 'Processing...' :
                   `Open ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Position`}
                </button>

                {/* Info Section */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedType === 'futures' &&
                      'Futures contracts allow you to lock in a price for a card transaction at a future date. Go LONG if you expect prices to rise, or SHORT if you expect prices to fall. Requires 20% collateral.'}
                    {selectedType === 'options' &&
                      'Options give you the right (but not obligation) to buy (CALL) or sell (PUT) a card at a specific strike price. You pay a premium upfront, which is your maximum loss. Profit potential is unlimited for calls, and substantial for puts.'}
                    {selectedType === 'swaps' &&
                      'Swaps allow you to exchange cash flows based on two card price movements. Perfect for hedging - if you own Card A and want protection against it falling while Card B rises, you can enter a swap. Net settlement at maturity means you only pay/receive the difference.'}
                  </p>
                </div>
              </div>

              {/* Active Positions */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Your Active Positions</h2>
                <PositionsList key={positionsKey} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
