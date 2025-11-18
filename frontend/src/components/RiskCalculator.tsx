import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Percent, Target } from 'lucide-react';

interface RiskCalculatorProps {
  currentPrice?: number;
  onCalculate?: (results: RiskResults) => void;
}

interface RiskResults {
  profitPotential: number;
  lossPotential: number;
  requiredCollateral: number;
  leverage: number;
  riskRewardRatio: number;
  liquidationPrice?: number;
}

export default function RiskCalculator({ currentPrice = 0, onCalculate }: RiskCalculatorProps) {
  const [derivativeType, setDerivativeType] = useState<'futures' | 'options' | 'swaps'>('futures');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop-loss' | 'take-profit' | 'trailing-stop'>('market');
  const [position, setPosition] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState(currentPrice.toString());
  const [targetPrice, setTargetPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [leverage, setLeverage] = useState('5');
  const [trailingPercent, setTrailingPercent] = useState('5');

  const [results, setResults] = useState<RiskResults | null>(null);

  useEffect(() => {
    if (currentPrice > 0 && entryPrice === '0') {
      setEntryPrice(currentPrice.toString());
    }
  }, [currentPrice]);

  const calculateRisk = () => {
    const entry = parseFloat(entryPrice) || 0;
    const target = parseFloat(targetPrice) || 0;
    const stop = parseFloat(stopLoss) || 0;
    const qty = parseFloat(quantity) || 1;
    const lev = parseFloat(leverage) || 1;

    if (entry === 0 || target === 0 || stop === 0) {
      return;
    }

    let profitPotential = 0;
    let lossPotential = 0;
    let requiredCollateral = 0;
    let liquidationPrice = 0;

    switch (derivativeType) {
      case 'futures':
        if (position === 'long') {
          profitPotential = (target - entry) * qty * lev;
          lossPotential = (entry - stop) * qty * lev;
          liquidationPrice = entry * (1 - 1 / lev);
        } else {
          profitPotential = (entry - target) * qty * lev;
          lossPotential = (stop - entry) * qty * lev;
          liquidationPrice = entry * (1 + 1 / lev);
        }
        requiredCollateral = (entry * qty) / lev;
        break;

      case 'options':
        const premium = entry * 0.1; // Assume 10% premium
        profitPotential = Math.max(0, target - entry - premium) * qty;
        lossPotential = premium * qty;
        requiredCollateral = premium * qty;
        break;

      case 'swaps':
        profitPotential = Math.abs(target - entry) * qty * 0.5; // Simplified
        lossPotential = Math.abs(stop - entry) * qty * 0.5;
        requiredCollateral = entry * qty * 0.15;
        break;
    }

    const riskRewardRatio = lossPotential > 0 ? profitPotential / lossPotential : 0;

    const calculatedResults: RiskResults = {
      profitPotential: Math.abs(profitPotential),
      lossPotential: Math.abs(lossPotential),
      requiredCollateral,
      leverage: lev,
      riskRewardRatio,
      liquidationPrice: liquidationPrice > 0 ? liquidationPrice : undefined,
    };

    setResults(calculatedResults);
    if (onCalculate) {
      onCalculate(calculatedResults);
    }
  };

  useEffect(() => {
    if (entryPrice && targetPrice && stopLoss) {
      calculateRisk();
    }
  }, [entryPrice, targetPrice, stopLoss, quantity, leverage, derivativeType, position]);

  const getRiskLevel = () => {
    if (!results) return 'neutral';
    if (results.riskRewardRatio >= 2) return 'low';
    if (results.riskRewardRatio >= 1) return 'medium';
    return 'high';
  };

  const riskLevel = getRiskLevel();
  const riskColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
    neutral: 'text-gray-400',
  }[riskLevel];

  return (
    <div className="bg-white/5 light:bg-white/70 backdrop-blur-md border border-white/10 light:border-gray-300 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white light:text-gray-900">Risk Calculator</h2>
      </div>

      {/* Derivative Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
          Derivative Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['futures', 'options', 'swaps'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setDerivativeType(type)}
              className={`py-2 px-4 rounded-lg font-semibold capitalize transition ${
                derivativeType === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 light:bg-gray-200 text-gray-300 light:text-gray-700 hover:bg-white/20 light:hover:bg-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
          Order Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {([
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit' },
            { value: 'stop-loss', label: 'Stop-Loss' },
            { value: 'take-profit', label: 'Take-Profit' },
            { value: 'trailing-stop', label: 'Trailing' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setOrderType(value)}
              className={`py-2 px-3 rounded-lg font-semibold text-sm transition ${
                orderType === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 light:bg-gray-200 text-gray-300 light:text-gray-700 hover:bg-white/20 light:hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 light:text-gray-600 mt-2">
          {orderType === 'market' && 'Execute immediately at current market price'}
          {orderType === 'limit' && 'Execute only at your specified price or better'}
          {orderType === 'stop-loss' && 'Automatically close position to limit losses'}
          {orderType === 'take-profit' && 'Automatically close position at target profit'}
          {orderType === 'trailing-stop' && 'Dynamic stop-loss that follows price movements'}
        </p>
      </div>

      {/* Position Type */}
      {derivativeType === 'futures' && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPosition('long')}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                position === 'long'
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 light:bg-gray-200 text-gray-300 light:text-gray-700 hover:bg-white/20 light:hover:bg-gray-300'
              }`}
            >
              Long
            </button>
            <button
              onClick={() => setPosition('short')}
              className={`py-2 px-4 rounded-lg font-semibold transition ${
                position === 'short'
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 light:bg-gray-200 text-gray-300 light:text-gray-700 hover:bg-white/20 light:hover:bg-gray-300'
              }`}
            >
              Short
            </button>
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
            Entry Price (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white/10 light:bg-white border border-white/20 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
            Target Price (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white/10 light:bg-white border border-white/20 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
            Stop Loss (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 bg-white/10 light:bg-white border border-white/20 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            className="w-full px-4 py-3 bg-white/10 light:bg-white border border-white/20 light:border-gray-300 rounded-lg text-white light:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {derivativeType === 'futures' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
              Leverage: {leverage}x
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 light:text-gray-600 mt-1">
              <span>1x</span>
              <span>5x</span>
              <span>10x</span>
            </div>
          </div>
        )}

        {orderType === 'trailing-stop' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 light:text-gray-700 mb-2">
              Trailing Distance: {trailingPercent}%
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={trailingPercent}
              onChange={(e) => setTrailingPercent(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 light:text-gray-600 mt-1">
              <span>1%</span>
              <span>10%</span>
              <span>20%</span>
            </div>
            <p className="text-xs text-gray-400 light:text-gray-600 mt-2">
              Current trailing stop: ${(parseFloat(entryPrice || '0') * (1 - parseFloat(trailingPercent) / 100)).toFixed(4)} ETH
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="border-t border-white/10 light:border-gray-300 pt-4">
            <h3 className="text-lg font-semibold text-white light:text-gray-900 mb-4">Risk Analysis</h3>

            {/* Risk Level Badge */}
            <div className="mb-4 p-3 rounded-lg bg-white/5 light:bg-gray-100 border border-white/10 light:border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 light:text-gray-700">Risk Level:</span>
                <span className={`font-bold capitalize ${riskColor}`}>
                  {riskLevel}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-300 light:text-gray-700">Risk/Reward Ratio:</span>
                <span className="text-white light:text-gray-900 font-semibold">
                  1:{results.riskRewardRatio.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 light:bg-green-100 border border-green-500/30 light:border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300 light:text-gray-700">Profit Potential</span>
                </div>
                <div className="text-2xl font-bold text-green-400 light:text-green-600">
                  +{results.profitPotential.toFixed(4)} ETH
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-500/10 light:bg-red-100 border border-red-500/30 light:border-red-300">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-300 light:text-gray-700">Loss Potential</span>
                </div>
                <div className="text-2xl font-bold text-red-400 light:text-red-600">
                  -{results.lossPotential.toFixed(4)} ETH
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 light:bg-purple-100 border border-purple-500/30 light:border-purple-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300 light:text-gray-700">Required Collateral</span>
                </div>
                <div className="text-2xl font-bold text-purple-400 light:text-purple-600">
                  {results.requiredCollateral.toFixed(4)} ETH
                </div>
              </div>

              {results.liquidationPrice && (
                <div className="p-4 rounded-lg bg-yellow-500/10 light:bg-yellow-100 border border-yellow-500/30 light:border-yellow-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-300 light:text-gray-700">Liquidation Price</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 light:text-yellow-600">
                    {results.liquidationPrice.toFixed(4)} ETH
                  </div>
                </div>
              )}
            </div>

            {/* Risk Warning */}
            {riskLevel === 'high' && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 light:bg-red-100 border border-red-500/30 light:border-red-300">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300 light:text-red-700">
                    <strong>High Risk Warning:</strong> Your risk/reward ratio is below 1:1. Consider adjusting your stop loss or target price for better risk management.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
