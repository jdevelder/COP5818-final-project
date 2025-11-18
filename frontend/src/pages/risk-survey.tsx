import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAccount } from 'wagmi';

interface SurveyData {
  experience: string;
  riskTolerance: string;
  investmentGoal: string;
  timeHorizon: string;
  portfolioSize: string;
  tradingStyle: string;
  lossComfort: string;
}

export default function RiskSurveyPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    experience: '',
    riskTolerance: '',
    investmentGoal: '',
    timeHorizon: '',
    portfolioSize: '',
    tradingStyle: '',
    lossComfort: '',
  });

  // Load existing profile if available
  useEffect(() => {
    const savedProfile = localStorage.getItem('userRiskProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setSurveyData(profile.surveyData);
        setIsUpdating(true);
      } catch (error) {
        console.error('Error loading existing profile:', error);
      }
    }
  }, []);

  const questions = [
    {
      id: 'experience',
      title: 'What is your trading experience level?',
      icon: BarChart3,
      options: [
        { value: 'beginner', label: 'Beginner', description: 'New to trading and derivatives' },
        { value: 'intermediate', label: 'Intermediate', description: '1-3 years of trading experience' },
        { value: 'advanced', label: 'Advanced', description: '3+ years, familiar with complex strategies' },
        { value: 'expert', label: 'Expert', description: 'Professional trader or institutional experience' },
      ],
    },
    {
      id: 'riskTolerance',
      title: 'How would you describe your risk tolerance?',
      icon: Shield,
      options: [
        { value: 'conservative', label: 'Conservative', description: 'Prioritize capital preservation over growth' },
        { value: 'moderate', label: 'Moderate', description: 'Balance between growth and safety' },
        { value: 'aggressive', label: 'Aggressive', description: 'Willing to take significant risks for higher returns' },
        { value: 'very-aggressive', label: 'Very Aggressive', description: 'Maximize returns regardless of risk' },
      ],
    },
    {
      id: 'investmentGoal',
      title: 'What is your primary investment goal?',
      icon: Target,
      options: [
        { value: 'preservation', label: 'Capital Preservation', description: 'Protect existing wealth from inflation' },
        { value: 'income', label: 'Generate Income', description: 'Regular cash flows from trading' },
        { value: 'growth', label: 'Long-term Growth', description: 'Build wealth over time' },
        { value: 'speculation', label: 'Short-term Speculation', description: 'Quick profits from market movements' },
      ],
    },
    {
      id: 'timeHorizon',
      title: 'What is your typical investment time horizon?',
      icon: Clock,
      options: [
        { value: 'day', label: 'Day Trading', description: 'Open and close positions within a day' },
        { value: 'week', label: 'Short-term', description: 'Hold positions for days to weeks' },
        { value: 'month', label: 'Medium-term', description: 'Hold positions for weeks to months' },
        { value: 'year', label: 'Long-term', description: 'Hold positions for months to years' },
      ],
    },
    {
      id: 'portfolioSize',
      title: 'What is your intended trading portfolio size?',
      icon: DollarSign,
      options: [
        { value: 'small', label: 'Under $1,000', description: 'Starting small to learn' },
        { value: 'medium', label: '$1,000 - $10,000', description: 'Moderate capital allocation' },
        { value: 'large', label: '$10,000 - $50,000', description: 'Significant investment' },
        { value: 'very-large', label: 'Over $50,000', description: 'Major capital deployment' },
      ],
    },
    {
      id: 'tradingStyle',
      title: 'What trading style suits you best?',
      icon: TrendingUp,
      options: [
        { value: 'systematic', label: 'Systematic', description: 'Follow rules and algorithms strictly' },
        { value: 'discretionary', label: 'Discretionary', description: 'Make decisions based on analysis and intuition' },
        { value: 'passive', label: 'Passive', description: 'Buy and hold with minimal activity' },
        { value: 'active', label: 'Very Active', description: 'Frequent trading and position adjustments' },
      ],
    },
    {
      id: 'lossComfort',
      title: 'What is the maximum loss you could tolerate?',
      icon: TrendingUp,
      options: [
        { value: 'very-low', label: '5% or less', description: 'Minimal loss tolerance' },
        { value: 'low', label: '5-15%', description: 'Low loss tolerance' },
        { value: 'moderate', label: '15-30%', description: 'Moderate loss tolerance' },
        { value: 'high', label: 'Over 30%', description: 'High loss tolerance for potential gains' },
      ],
    },
  ];

  const currentQuestion = questions[currentStep];
  const Icon = currentQuestion.icon;

  const handleSelect = (value: string) => {
    setSurveyData({
      ...surveyData,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    // Calculate risk profile based on answers
    const profile = calculateRiskProfile(surveyData);

    // Store in localStorage (in production, this would be stored in a database)
    const userProfile = {
      address,
      surveyData,
      profile,
      completedAt: Date.now(),
    };

    localStorage.setItem('userRiskProfile', JSON.stringify(userProfile));

    // Show success and redirect
    const message = isUpdating
      ? 'Risk profile updated! Your AI recommendations will now reflect your updated preferences.'
      : 'Risk profile saved! Our AI will now provide personalized recommendations based on your profile.';
    alert(message);
    router.push('/trade');
  };

  const calculateRiskProfile = (data: SurveyData): string => {
    const scores = {
      conservative: 0,
      moderate: 0,
      aggressive: 0,
    };

    // Score based on risk tolerance
    if (data.riskTolerance === 'conservative') scores.conservative += 3;
    if (data.riskTolerance === 'moderate') scores.moderate += 3;
    if (data.riskTolerance === 'aggressive' || data.riskTolerance === 'very-aggressive') scores.aggressive += 3;

    // Score based on experience
    if (data.experience === 'beginner') scores.conservative += 2;
    if (data.experience === 'intermediate') scores.moderate += 2;
    if (data.experience === 'advanced' || data.experience === 'expert') scores.aggressive += 2;

    // Score based on investment goal
    if (data.investmentGoal === 'preservation') scores.conservative += 2;
    if (data.investmentGoal === 'income' || data.investmentGoal === 'growth') scores.moderate += 2;
    if (data.investmentGoal === 'speculation') scores.aggressive += 2;

    // Score based on loss comfort
    if (data.lossComfort === 'very-low' || data.lossComfort === 'low') scores.conservative += 2;
    if (data.lossComfort === 'moderate') scores.moderate += 2;
    if (data.lossComfort === 'high') scores.aggressive += 2;

    // Determine overall profile
    const maxScore = Math.max(scores.conservative, scores.moderate, scores.aggressive);
    if (scores.conservative === maxScore) return 'conservative';
    if (scores.moderate === maxScore) return 'moderate';
    return 'aggressive';
  };

  const isCurrentStepComplete = surveyData[currentQuestion.id as keyof SurveyData] !== '';
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <>
      <Head>
        <title>Risk Tolerance Survey - TCG Derivatives</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isUpdating ? 'Update Your Risk Profile' : 'Create Your Risk Profile'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isUpdating
                ? 'Update your preferences to get better AI recommendations'
                : 'Help us personalize your trading experience with AI-powered insights'
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/70 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/10 rounded-2xl p-8 mb-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuestion.title}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition ${
                      surveyData[currentQuestion.id as keyof SurveyData] === option.value
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-300 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {option.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                      {surveyData[currentQuestion.id as keyof SurveyData] === option.value && (
                        <CheckCircle className="w-6 h-6 text-purple-500 flex-shrink-0 ml-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isCurrentStepComplete}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {currentStep < questions.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Complete Survey
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
