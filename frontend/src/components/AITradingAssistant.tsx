import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  MessageSquare,
  X,
  Send,
  Sparkles,
  BarChart3,
  Shield
} from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { usePriceOracle } from '@/hooks/usePriceOracle';
import { formatEther } from 'viem';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'analysis';
  title: string;
  message: string;
  confidence: number;
  actionable: boolean;
  cardId?: string;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface UserProfile {
  address: string;
  surveyData: {
    experience: string;
    riskTolerance: string;
    investmentGoal: string;
    timeHorizon: string;
    portfolioSize: string;
    tradingStyle: string;
    lossComfort: string;
  };
  profile: string;
  completedAt: number;
}

export default function AITradingAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [cardPrices, setCardPrices] = useState<Map<string, string>>(new Map());
  const { prices, isConnected } = useWebSocket();
  const { getPrice } = usePriceOracle();

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userRiskProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  }, []);

  // Handle "Take Action" from insights
  const handleTakeAction = (insight: Insight) => {
    // Store insight in localStorage
    localStorage.setItem('pendingInsightAction', JSON.stringify(insight));

    // Navigate to trade page
    router.push('/trade');
  };

  // Check for pending insight action on mount
  useEffect(() => {
    const pendingAction = localStorage.getItem('pendingInsightAction');
    if (pendingAction) {
      try {
        const insight: Insight = JSON.parse(pendingAction);

        // Open assistant and switch to chat
        setIsOpen(true);
        setActiveTab('chat');

        // Generate trading recommendation based on insight
        const recommendation = generateTradingRecommendation(insight);

        // Add recommendation to chat
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: `action_${Date.now()}`,
            role: 'assistant',
            content: recommendation,
            timestamp: Date.now(),
          }]);
        }, 500);

        // Clear the pending action
        localStorage.removeItem('pendingInsightAction');
      } catch (error) {
        console.error('Error processing pending insight action:', error);
        localStorage.removeItem('pendingInsightAction');
      }
    }
  }, []);

  // Fetch card price helper
  const getCardPrice = async (cardId: string): Promise<string> => {
    try {
      const price = await getPrice(cardId);
      const ethPrice = formatEther(price);
      setCardPrices(prev => new Map(prev).set(cardId, ethPrice));
      return ethPrice;
    } catch (error) {
      console.error('Error fetching card price:', error);
      return '0';
    }
  };

  const generateTradingRecommendation = (insight: Insight): string => {
    const cardName = insight.cardId ? insight.cardId.replace(/-/g, ' ') : '';
    const cardId = insight.cardId || '';

    // Get current price from cache or default
    const currentPrice = parseFloat(cardPrices.get(cardId) || '0');

    // If we don't have price cached, fetch it async and use a placeholder for now
    if (currentPrice === 0 && cardId) {
      getCardPrice(cardId).then(() => {
        // Price will be updated in state, triggering re-render
      });
    }

    // Get personalized parameters based on user profile
    const getPersonalizedParams = () => {
      if (!userProfile) {
        return {
          positionSize: '2-5%',
          stopLoss: '-10%',
          takeProfit: '+15-20%',
          strategy: 'moderate',
          leverage: 'low to medium',
        };
      }

      const { profile, surveyData } = userProfile;

      if (profile === 'conservative' || surveyData.riskTolerance === 'conservative') {
        return {
          positionSize: '1-3%',
          stopLoss: '-5%',
          takeProfit: '+8-12%',
          strategy: 'Options or protected futures',
          leverage: 'minimal',
        };
      } else if (profile === 'aggressive' || surveyData.riskTolerance === 'aggressive' || surveyData.riskTolerance === 'very-aggressive') {
        return {
          positionSize: '5-10%',
          stopLoss: '-15%',
          takeProfit: '+25-40%',
          strategy: 'Leveraged futures or naked options',
          leverage: 'medium to high',
        };
      } else {
        return {
          positionSize: '3-5%',
          stopLoss: '-10%',
          takeProfit: '+15-20%',
          strategy: 'Balanced futures and options',
          leverage: 'moderate',
        };
      }
    };

    const params = getPersonalizedParams();
    const experienceLevel = userProfile?.surveyData.experience || 'intermediate';
    const investmentGoal = userProfile?.surveyData.investmentGoal || 'growth';

    switch (insight.type) {
      case 'opportunity':
        if (insight.message.includes('uptrend') || insight.message.includes('momentum')) {
          let recommendation = `🎯 **Personalized Trading Recommendation for ${cardName}**\n\n`;

          // Calculate specific values based on current price
          const strikePrice = (currentPrice * 1.04).toFixed(4); // 4% above
          const premium = (currentPrice * 0.10).toFixed(4); // 10% premium
          const stopLossPrice = (currentPrice * 0.90).toFixed(4); // -10% stop loss
          const takeProfitPrice = (currentPrice * 1.20).toFixed(4); // +20% take profit

          // Calculate maturity date (30 days from now)
          const maturityDate = new Date();
          maturityDate.setDate(maturityDate.getDate() + 30);

          recommendation += `📊 **Current Market Data:**\n`;
          recommendation += `- **${cardName} Current Price:** ${currentPrice > 0 ? currentPrice.toFixed(4) : 'Loading...'} ETH\n`;
          recommendation += `- **24h Change:** ${insight.message.includes('uptrend') ? '↗️ Uptrend detected' : '📈 Momentum building'}\n\n`;

          if (userProfile) {
            recommendation += `Based on your **${userProfile.profile}** risk profile and **${experienceLevel}** experience level, here's my recommendation:\n\n`;
          } else {
            recommendation += `⚠️ **Note:** Complete the risk survey for personalized recommendations!\n\n`;
          }

          recommendation += `**Recommended Position Type:** ${params.strategy}\n`;
          recommendation += `**Entry Strategy:** Enter at current market price (${currentPrice > 0 ? currentPrice.toFixed(4) : 'Loading...'} ETH)\n`;
          recommendation += `**Position Size:** ${params.positionSize} of your portfolio\n`;
          recommendation += `**Stop Loss:** ${currentPrice > 0 ? stopLossPrice : 'TBD'} ETH (${params.stopLoss})\n`;
          recommendation += `**Take Profit:** ${currentPrice > 0 ? takeProfitPrice : 'TBD'} ETH (${params.takeProfit})\n\n`;

          if (experienceLevel === 'beginner' || experienceLevel === 'intermediate') {
            recommendation += `**Beginner-Friendly Alternative:** Start with CALL options to limit downside:\n`;
            if (currentPrice > 0) {
              recommendation += `- **Strike Price:** ${strikePrice} ETH (4% above current)\n`;
              recommendation += `- **Premium:** ~${premium} ETH (10% of position, this is your max loss)\n`;
              recommendation += `- **Expiration:** ${maturityDate.toLocaleDateString()} (30 days)\n`;
              recommendation += `- **Collateral Required:** ${premium} ETH\n`;
              recommendation += `- **Maximum Loss:** ${premium} ETH (premium only)\n`;
              recommendation += `- **Breakeven Price:** ${(parseFloat(strikePrice) + parseFloat(premium)).toFixed(4)} ETH\n\n`;
            } else {
              recommendation += `- Strike Price: 4% above current price\n`;
              recommendation += `- Premium: ~10% of strike price\n`;
              recommendation += `- Expiration: 30 days\n`;
              recommendation += `- Maximum loss: Premium paid only\n\n`;
            }
          }

          if (userProfile?.surveyData.portfolioSize) {
            const portfolioGuidance = userProfile.surveyData.portfolioSize === 'small'
              ? 'With a smaller portfolio, focus on learning with minimal position sizes. Consider paper trading first!'
              : userProfile.surveyData.portfolioSize === 'very-large'
              ? 'With significant capital, consider diversifying across multiple positions and using professional risk management tools.'
              : 'Your portfolio size allows for measured positions. Focus on consistency over home runs.';
            recommendation += `**Portfolio Guidance:** ${portfolioGuidance}\n\n`;
          }

          recommendation += `**Risk Management:** Monitor this position ${userProfile?.surveyData.timeHorizon === 'day' ? 'intraday' : 'daily'} and be ready to exit if momentum reverses.\n\n`;
          recommendation += `Need help calculating exact position sizing? Ask me!`;

          return recommendation;
        }
        break;

      case 'warning':
        if (insight.message.includes('downtrend') || insight.message.includes('declining')) {
          const putStrike = (currentPrice * 0.95).toFixed(4); // 95% of current
          const putPremium = (currentPrice * 0.08).toFixed(4); // 8% premium for protection
          const shortStopLoss = (currentPrice * 1.08).toFixed(4); // +8% stop
          const shortTarget = (currentPrice * 0.85).toFixed(4); // -15% target

          let warning = `⚠️ **Risk Management Recommendation for ${cardName}**\n\n`;
          warning += `📊 **Current Market Data:**\n`;
          warning += `- **${cardName} Current Price:** ${currentPrice > 0 ? currentPrice.toFixed(4) : 'Loading...'} ETH\n`;
          warning += `- **Trend:** ⬇️ Downtrend detected\n\n`;

          warning += `The downtrend alert suggests defensive action. Here are your options:\n\n`;

          warning += `**If you own this card:**\n`;
          warning += `1. **Protective Put Strategy (Recommended)**\n`;
          if (currentPrice > 0) {
            warning += `   - **Buy PUT Strike:** ${putStrike} ETH (95% of current price)\n`;
            warning += `   - **Premium Cost:** ~${putPremium} ETH (8% - this is your insurance cost)\n`;
            warning += `   - **Protection Level:** Limits losses below ${putStrike} ETH\n`;
            warning += `   - **Expiration:** 30 days\n`;
            warning += `   - Acts as insurance for your position\n`;
            warning += `   - Keeps upside potential unlimited\n\n`;
          } else {
            warning += `   - Buy PUT options at 95% of current price\n`;
            warning += `   - Acts as insurance for your position\n\n`;
          }

          warning += `2. **Reduce Position**\n`;
          warning += `   - Consider closing 30-50% of your position\n`;
          warning += `   - Lock in profits if you have gains\n`;
          warning += `   - Reduces exposure to further decline\n\n`;

          warning += `**If you don't own it:**\n`;
          warning += `1. **Wait and Watch**\n`;
          warning += `   - Let the downtrend play out\n`;
          warning += `   - Look for reversal signals before entering\n\n`;

          warning += `2. **Short Opportunity (Advanced)**\n`;
          if (currentPrice > 0) {
            warning += `   - **Open SHORT** futures at ${currentPrice.toFixed(4)} ETH\n`;
            warning += `   - **Stop Loss:** ${shortStopLoss} ETH (+8% above entry)\n`;
            warning += `   - **Target:** ${shortTarget} ETH (-15% profit)\n`;
            warning += `   - **Risk/Reward:** 8% risk for 15% gain (1.87:1)\n\n`;
          } else {
            warning += `   - Open SHORT futures position\n`;
            warning += `   - Set tight stop loss at +8% above entry\n`;
            warning += `   - Target -15% profit\n\n`;
          }

          warning += `**My Recommendation:** If you hold a position, buy protective puts NOW to limit downside risk. If you don't, wait for trend reversal confirmation.\n\n`;
          warning += `Need help executing the protective put strategy?`;

          return warning;
        }
        break;

      case 'analysis':
        if (insight.message.includes('volatility')) {
          const sellCallStrike = (currentPrice * 1.10).toFixed(4);
          const buyCallStrike = (currentPrice * 1.15).toFixed(4);
          const sellPutStrike = (currentPrice * 0.90).toFixed(4);
          const buyPutStrike = (currentPrice * 0.85).toFixed(4);
          const maxProfit = (currentPrice * 0.04).toFixed(4); // ~4% premium
          const maxLoss = (currentPrice * 0.01).toFixed(4); // Difference minus premium

          let analysis = `📊 **Volatility Trading Strategy for ${cardName}**\n\n`;
          analysis += `📊 **Current Market Data:**\n`;
          analysis += `- **${cardName} Current Price:** ${currentPrice > 0 ? currentPrice.toFixed(4) : 'Loading...'} ETH\n`;
          analysis += `- **Volatility:** High (ideal for options selling)\n\n`;

          analysis += `High volatility creates opportunities for options traders:\n\n`;
          analysis += `**Recommended Strategy: Iron Condor**\n\n`;
          analysis += `This neutral strategy profits from sideways movement:\n\n`;

          if (currentPrice > 0) {
            analysis += `**Specific Setup for ${cardName}:**\n`;
            analysis += `1. **Sell CALL** at ${sellCallStrike} ETH (+10% above current)\n`;
            analysis += `2. **Buy CALL** at ${buyCallStrike} ETH (+15% above current)\n`;
            analysis += `3. **Sell PUT** at ${sellPutStrike} ETH (-10% below current)\n`;
            analysis += `4. **Buy PUT** at ${buyPutStrike} ETH (-15% below current)\n\n`;

            analysis += `**Profit Zone:** Price stays between ${sellPutStrike} and ${sellCallStrike} ETH\n`;
            analysis += `**Max Profit:** ~${maxProfit} ETH (premium collected)\n`;
            analysis += `**Max Loss:** ~${maxLoss} ETH (strike difference minus premium)\n`;
            analysis += `**Expiration:** 30 days\n`;
            analysis += `**Breakeven Points:** ${(parseFloat(sellPutStrike) - parseFloat(maxProfit)).toFixed(4)} ETH (lower) | ${(parseFloat(sellCallStrike) + parseFloat(maxProfit)).toFixed(4)} ETH (upper)\n\n`;
          } else {
            analysis += `**Setup:**\n`;
            analysis += `1. Sell CALL at +10% above current price\n`;
            analysis += `2. Buy CALL at +15% above current price\n`;
            analysis += `3. Sell PUT at -10% below current price\n`;
            analysis += `4. Buy PUT at -15% below current price\n\n`;
            analysis += `**Profit Zone:** Price stays between -10% and +10%\n`;
            analysis += `**Max Profit:** Premium collected (approx 3-5%)\n`;
            analysis += `**Max Loss:** Difference between strikes minus premium\n`;
            analysis += `**Expiration:** 30 days\n\n`;
          }

          analysis += `**Why this works:**\n`;
          analysis += `- High volatility = higher option premiums\n`;
          analysis += `- You collect premium from selling options\n`;
          analysis += `- Protected by bought options on both sides\n`;
          analysis += `- Time decay works in your favor\n\n`;

          analysis += `**Alternative for Beginners:** If iron condors seem complex, try a simple **PUT spread** or **CALL spread** depending on your market bias.\n\n`;
          analysis += `Want me to walk you through setting up the iron condor step by step?`;

          return analysis;
        }
        break;

      case 'recommendation':
        if (insight.message.includes('bullish')) {
          return `🚀 **Bullish Market Strategy**\n\nWith overall market trending upward, here's how to capitalize:\n\n**Aggressive Approach:**\n- Long futures on top 3 strongest cards\n- 3-5% allocation per position\n- Ride the momentum wave\n\n**Moderate Approach:**\n- Buy CALL options on strong performers\n- Spread risk across 4-6 different cards\n- Options limit downside to premium paid\n\n**Conservative Approach:**\n- Bull call spreads (buy lower strike, sell higher strike)\n- Reduces cost, limits profit, but maintains positive exposure\n\n**Cards to Watch:**\nBased on current momentum, I recommend focusing on cards showing the strongest 24h gains. Look at the live prices and identify the top 2-3 performers.\n\n**Risk Management:**\n- Diversify across multiple cards\n- Use stop losses at -12%\n- Take partial profits at +20%\n- Don't chase - wait for pullbacks to enter\n\n**Entry Timing:** Don't enter all at once. Scale in over 2-3 days to average your entry price.\n\nWhich approach matches your risk tolerance?`;
        } else if (insight.message.includes('bearish')) {
          return `🛡️ **Defensive Strategy for Bearish Market**\n\nMarket weakness detected. Here's how to protect yourself:\n\n**If Holding Positions:**\n1. **Immediate Protection**\n   - Buy protective puts on largest positions\n   - Consider reducing position sizes by 30-50%\n   - Tighten stop losses to -8%\n\n2. **Hedge Strategy**\n   - Open small SHORT positions on weakest cards\n   - Acts as portfolio hedge\n   - Gains offset losses in long positions\n\n**If No Positions:**\n1. **Wait for Opportunity**\n   - Stay in cash/stablecoins\n   - Watch for reversal signals\n   - Prepare watchlist for entry\n\n2. **Short Selling (Advanced)**\n   - SHORT futures on weakest performers\n   - Strict stop loss at +10%\n   - Take profits at -15% to -20%\n\n**What NOT to do:**\n- Don't try to catch falling knives\n- Don't add to losing positions\n- Don't ignore the trend\n\n**My Recommendation:** Preserve capital. Reduce risk exposure. Wait for clearer signals before re-entering. Better to miss some downside than lose capital.\n\nNeed help identifying which positions to close first?`;
        }
        break;
    }

    return `I recommend taking action on this insight. Would you like me to help you develop a specific trading strategy based on current market conditions?`;
  };

  // Generate AI insights based on market conditions
  useEffect(() => {
    if (!isConnected) return;

    const generateInsights = () => {
      const priceArray = Array.from(prices.values());
      const newInsights: Insight[] = [];

      // Analyze each card's price movement
      priceArray.forEach(priceUpdate => {
        // Strong uptrend opportunity
        if (priceUpdate.change24h > 5) {
          newInsights.push({
            id: `insight_${Date.now()}_${priceUpdate.cardId}_up`,
            type: 'opportunity',
            title: 'Strong Uptrend Detected',
            message: `${priceUpdate.cardId.replace(/-/g, ' ')} is showing strong momentum (+${priceUpdate.change24h.toFixed(2)}%). Consider taking a LONG position.`,
            confidence: 85,
            actionable: true,
            cardId: priceUpdate.cardId,
            timestamp: Date.now(),
          });
        }

        // Strong downtrend warning
        if (priceUpdate.change24h < -5) {
          newInsights.push({
            id: `insight_${Date.now()}_${priceUpdate.cardId}_down`,
            type: 'warning',
            title: 'Downtrend Alert',
            message: `${priceUpdate.cardId.replace(/-/g, ' ')} is declining sharply (${priceUpdate.change24h.toFixed(2)}%). Consider protective puts or reduce exposure.`,
            confidence: 80,
            actionable: true,
            cardId: priceUpdate.cardId,
            timestamp: Date.now(),
          });
        }

        // Volatility analysis
        if (Math.abs(priceUpdate.change24h) > 3 && Math.abs(priceUpdate.change24h) < 5) {
          newInsights.push({
            id: `insight_${Date.now()}_${priceUpdate.cardId}_vol`,
            type: 'analysis',
            title: 'Increased Volatility',
            message: `${priceUpdate.cardId.replace(/-/g, ' ')} showing elevated volatility. Options strategies may be favorable.`,
            confidence: 75,
            actionable: true,
            cardId: priceUpdate.cardId,
            timestamp: Date.now(),
          });
        }

        // Price consolidation (low volatility)
        if (Math.abs(priceUpdate.change24h) < 1) {
          newInsights.push({
            id: `insight_${Date.now()}_${priceUpdate.cardId}_consolidate`,
            type: 'analysis',
            title: 'Price Consolidation',
            message: `${priceUpdate.cardId.replace(/-/g, ' ')} is trading in a tight range. Potential breakout opportunity.`,
            confidence: 65,
            actionable: false,
            cardId: priceUpdate.cardId,
            timestamp: Date.now(),
          });
        }
      });

      // General market recommendations
      const avgChange = priceArray.reduce((sum, p) => sum + p.change24h, 0) / priceArray.length;

      if (avgChange > 2) {
        newInsights.push({
          id: `insight_${Date.now()}_market_bullish`,
          type: 'recommendation',
          title: 'Bullish Market Sentiment',
          message: `Overall market is trending upward (avg +${avgChange.toFixed(2)}%). Consider increasing long exposure or call options.`,
          confidence: 90,
          actionable: true,
          timestamp: Date.now(),
        });
      } else if (avgChange < -2) {
        newInsights.push({
          id: `insight_${Date.now()}_market_bearish`,
          type: 'recommendation',
          title: 'Bearish Market Sentiment',
          message: `Market showing weakness (avg ${avgChange.toFixed(2)}%). Consider defensive strategies or profit-taking.`,
          confidence: 90,
          actionable: true,
          timestamp: Date.now(),
        });
      }

      // Limit to 10 most recent insights
      setInsights(prev => [...newInsights, ...prev].slice(0, 10));
    };

    // Generate insights every 30 seconds
    const interval = setInterval(generateInsights, 30000);
    generateInsights(); // Initial generation

    return () => clearInterval(interval);
  }, [prices, isConnected]);

  // Initialize with personalized welcome message
  useEffect(() => {
    let welcomeMessage = "Hello! I'm your AI trading assistant. ";

    if (userProfile) {
      const { profile, surveyData } = userProfile;
      welcomeMessage += `I see you have a **${profile}** risk profile with ${surveyData.experience} trading experience. `;
      welcomeMessage += `I'll tailor my recommendations to match your ${surveyData.investmentGoal} goals and ${surveyData.timeHorizon} time horizon.\n\n`;
      welcomeMessage += `I can help you with:\n`;
      welcomeMessage += `• Personalized trading strategies based on YOUR risk tolerance\n`;
      welcomeMessage += `• Market analysis and price trend insights\n`;
      welcomeMessage += `• Position sizing calculations for your portfolio\n`;
      welcomeMessage += `• Risk management specific to your profile\n\n`;
      welcomeMessage += `What would you like to explore today?`;
    } else {
      welcomeMessage += "I can help you analyze market trends, suggest trading strategies, assess risk, and answer questions about derivatives trading.\n\n";
      welcomeMessage += "⚠️ **Tip:** Complete the [Risk Survey](/risk-survey) to get personalized recommendations tailored to your experience level and risk tolerance!\n\n";
      welcomeMessage += "How can I assist you today?";
    }

    // Update the welcome message
    setChatMessages(prev => {
      // If there are no messages, add welcome
      if (prev.length === 0) {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: Date.now(),
        }];
      }
      // If first message is welcome and content changed, update it
      if (prev[0].id === 'welcome' && prev[0].content !== welcomeMessage) {
        return [{
          id: 'welcome',
          role: 'assistant',
          content: welcomeMessage,
          timestamp: Date.now(),
        }, ...prev.slice(1)];
      }
      // Otherwise keep messages as is
      return prev;
    });
  }, [userProfile]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    const inputCopy = chatInput;
    setChatInput('');

    // Generate AI response (async for price fetching)
    try {
      const response = await generateAIResponse(inputCopy);
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateAIResponse = async (input: string): Promise<string> => {
    const lower = input.toLowerCase();

    // Check for trade recommendation requests
    const tradeKeywords = ['trade', 'recommend', 'enter', 'buy', 'sell', 'what should', 'how to'];
    const cardNames = ['charizard', 'pikachu', 'blastoise', 'venusaur', 'black lotus', 'time walk'];
    const derivativeTypes = ['future', 'option', 'swap', 'call', 'put'];

    const requestingTrade = tradeKeywords.some(keyword => lower.includes(keyword));
    const mentionedCard = cardNames.find(card => lower.includes(card));
    const mentionedDerivative = derivativeTypes.find(type => lower.includes(type));

    if (requestingTrade && mentionedCard) {
      // Extract card ID
      let cardId = '';
      if (lower.includes('charizard')) cardId = 'Charizard-BaseSet-Rare';
      else if (lower.includes('pikachu')) cardId = 'PikachuEX-XY-Rare';
      else if (lower.includes('blastoise')) cardId = 'Blastoise-BaseSet-Rare';
      else if (lower.includes('venusaur')) cardId = 'Venusaur-BaseSet-Rare';
      else if (lower.includes('black lotus')) cardId = 'BlackLotus-Alpha-Mythic';
      else if (lower.includes('time walk')) cardId = 'TimeWalk-Alpha-Rare';

      // Fetch the price
      const priceEth = await getCardPrice(cardId);
      const currentPrice = parseFloat(priceEth);
      const cardName = cardId.replace(/-/g, ' ');

      if (currentPrice > 0) {
        // Determine derivative type
        const isOptions = mentionedDerivative === 'option' || mentionedDerivative === 'call' || mentionedDerivative === 'put';
        const isFutures = mentionedDerivative === 'future';
        const isSwaps = mentionedDerivative === 'swap';

        // Calculate recommendations based on user profile
        const params = userProfile?.profile === 'conservative'
          ? { stopLoss: 0.95, takeProfit: 1.12, duration: 7 }
          : userProfile?.profile === 'aggressive'
          ? { stopLoss: 0.85, takeProfit: 1.40, duration: 30 }
          : { stopLoss: 0.90, takeProfit: 1.20, duration: 30 };

        let response = `## 🎯 Trade Setup for ${cardName}\n\n`;
        response += `📊 **Current Price:** ${currentPrice.toFixed(4)} ETH\n\n`;

        if (isOptions || (!isFutures && !isSwaps)) {
          // Default to OPTIONS recommendation
          const strikePrice = (currentPrice * 1.04).toFixed(4);
          const premium = (currentPrice * 0.10).toFixed(4);
          const expiration = new Date();
          expiration.setDate(expiration.getDate() + params.duration);

          response += `### Recommended: CALL Options\n\n`;
          response += `**📝 Exact Form Inputs:**\n`;
          response += `- **Option Type:** CALL (Right to Buy)\n`;
          response += `- **Strike Price:** \`${strikePrice}\` ETH\n`;
          response += `- **Premium:** \`${premium}\` ETH\n`;
          response += `- **Quantity:** \`1\` contract\n`;
          response += `- **Duration:** \`${params.duration}\` days\n\n`;

          response += `**💰 Cost Breakdown:**\n`;
          response += `- Collateral Required: ${premium} ETH\n`;
          response += `- Maximum Loss: ${premium} ETH (premium only)\n`;
          response += `- Breakeven: ${(parseFloat(strikePrice) + parseFloat(premium)).toFixed(4)} ETH\n`;
          response += `- Profit Target: ${(currentPrice * params.takeProfit).toFixed(4)} ETH\n\n`;

          response += `**📅 Expiration:** ${expiration.toLocaleDateString()}\n\n`;
          response += `Simply copy these values into the Options form on the trade page!`;

        } else if (isFutures) {
          const strikePrice = currentPrice.toFixed(4);
          const stopLoss = (currentPrice * params.stopLoss).toFixed(4);
          const takeProfit = (currentPrice * params.takeProfit).toFixed(4);
          const collateral = (currentPrice * 0.20).toFixed(4); // 20% collateral

          response += `### Recommended: LONG Futures\n\n`;
          response += `**📝 Exact Form Inputs:**\n`;
          response += `- **Position Type:** LONG (Buy)\n`;
          response += `- **Strike Price:** \`${strikePrice}\` ETH\n`;
          response += `- **Quantity:** \`1\` contract\n`;
          response += `- **Duration:** \`${params.duration}\` days\n\n`;

          response += `**💰 Cost Breakdown:**\n`;
          response += `- Collateral Required: ${collateral} ETH (20%)\n`;
          response += `- Stop Loss: ${stopLoss} ETH\n`;
          response += `- Take Profit: ${takeProfit} ETH\n\n`;

          response += `Simply copy these values into the Futures form on the trade page!`;
        }

        return response;
      } else {
        return `Fetching price for ${cardName}... Please ask again in a moment.`;
      }
    }

    // Market analysis
    if (lower.includes('market') || lower.includes('trend')) {
      const priceArray = Array.from(prices.values());
      const avgChange = priceArray.reduce((sum, p) => sum + p.change24h, 0) / priceArray.length;

      if (avgChange > 1) {
        return `The market is currently showing bullish momentum with an average gain of ${avgChange.toFixed(2)}% across tracked cards. This suggests strong buying pressure. Consider long positions or call options on cards showing the strongest momentum.`;
      } else if (avgChange < -1) {
        return `Market sentiment appears bearish with an average decline of ${avgChange.toFixed(2)}%. I recommend defensive strategies like protective puts or reducing leveraged exposure until trends stabilize.`;
      } else {
        return `The market is consolidating with mixed signals (avg change: ${avgChange.toFixed(2)}%). This is a good time for range-bound strategies or waiting for clearer directional signals.`;
      }
    }

    // Risk management
    if (lower.includes('risk') || lower.includes('hedge')) {
      return "For effective risk management, I recommend: 1) Never allocate more than 5% of your portfolio to a single position, 2) Use stop-loss orders at 10-15% below entry, 3) Hedge large positions with protective puts, and 4) Diversify across multiple card types and derivative instruments.";
    }

    // Strategy advice
    if (lower.includes('strategy') || lower.includes('what should')) {
      return "Based on current market conditions, here are some strategies to consider:\n\n• **Bull Call Spread**: If moderately bullish, buy call options and sell higher strike calls to reduce cost\n• **Protective Put**: If holding long positions, buy puts as insurance\n• **Iron Condor**: If expecting low volatility, sell out-of-money puts and calls\n• **Futures Pairs Trade**: Go long on strong cards, short on weak ones";
    }

    // Card-specific
    if (lower.includes('charizard')) {
      const charizard = prices.get('Charizard-BaseSet-Rare');
      if (charizard) {
        return `Charizard Base Set is currently trading at $${charizard.price.toFixed(2)} with a 24h change of ${charizard.change24h > 0 ? '+' : ''}${charizard.change24h.toFixed(2)}%. ${charizard.change24h > 2 ? 'Strong uptrend suggests bullish momentum.' : charizard.change24h < -2 ? 'Downtrend indicates caution.' : 'Stable price action, watch for breakout signals.'}`;
      }
    }

    if (lower.includes('black lotus')) {
      const lotus = prices.get('BlackLotus-Alpha-Mythic');
      if (lotus) {
        return `Black Lotus Alpha is at $${lotus.price.toFixed(2)} (${lotus.change24h > 0 ? '+' : ''}${lotus.change24h.toFixed(2)}%). As a high-value card, it tends to be less volatile but offers strong long-term appreciation potential.`;
      }
    }

    // Options questions
    if (lower.includes('option') || lower.includes('call') || lower.includes('put')) {
      return "Options give you the right (not obligation) to buy/sell at a specific price. **Call options** profit when prices rise, while **Put options** profit when prices fall. Options are great for:\n• Hedging existing positions\n• Generating income through premium selling\n• Gaining leveraged exposure with limited downside";
    }

    // Futures questions
    if (lower.includes('future')) {
      return "Futures contracts lock in a price for future delivery. They're excellent for:\n• Hedging price risk for collectors/dealers\n• Speculating on price movements with leverage\n• Arbitrage opportunities\n\nRemember: Futures have unlimited downside, so use proper risk management!";
    }

    // Default helpful response
    return "I can help you with market analysis, strategy recommendations, risk assessment, and trading insights. Try asking me about specific cards, current market trends, hedging strategies, or which derivative type suits your goals best!";
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Sparkles className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'recommendation':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'analysis':
        return <BarChart3 className="w-5 h-5 text-purple-500" />;
      default:
        return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'bg-green-500/10 dark:bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 dark:bg-yellow-500/10 border-yellow-500/30';
      case 'recommendation':
        return 'bg-blue-500/10 dark:bg-blue-500/10 border-blue-500/30';
      case 'analysis':
        return 'bg-purple-500/10 dark:bg-purple-500/10 border-purple-500/30';
      default:
        return 'bg-gray-500/10 dark:bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[100] p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Brain className="w-6 h-6" />
          {insights.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </motion.button>

      {/* AI Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-300 dark:border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">AI Assistant</h3>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {isConnected ? 'Analyzing markets' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'insights'
                      ? 'bg-white dark:bg-gray-800 text-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Insights
                    {insights.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                        {insights.length}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition ${
                    activeTab === 'chat'
                      ? 'bg-white dark:bg-gray-800 text-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'insights' ? (
                <div className="space-y-3">
                  {insights.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Analyzing market data...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Insights will appear here
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {insights.map(insight => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`p-3 rounded-lg border ${getInsightBg(insight.type)}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">
                              {getInsightIcon(insight.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {insight.title}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                  <Shield className="w-3 h-3" />
                                  {insight.confidence}%
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {insight.message}
                              </p>
                              {insight.actionable && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => handleTakeAction(insight)}
                                    className="text-xs font-semibold text-purple-500 hover:text-purple-600 transition"
                                  >
                                    Take Action →
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-3 mb-3">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            {activeTab === 'chat' && (
              <div className="p-4 border-t border-gray-300 dark:border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
