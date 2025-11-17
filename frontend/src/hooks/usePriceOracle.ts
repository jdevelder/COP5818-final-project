import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { getContractAddress } from '@/config/contracts';
import PriceOracleABI from '@/contracts/PriceOracle.json';

export interface CardPrice {
  price: bigint;
  timestamp: bigint;
  confidence: bigint;
}

export interface PricePoint {
  price: bigint;
  timestamp: bigint;
}

export function usePriceOracle() {
  const { chain } = useAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);

  const chainId = chain?.id || 1337;
  const contractAddress = getContractAddress(chainId, 'PriceOracle') as `0x${string}`;

  /**
   * Get current price for a card
   */
  const getPrice = async (cardId: string): Promise<CardPrice | null> => {
    if (!publicClient) return null;

    setLoading(true);
    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: PriceOracleABI.abi,
        functionName: 'getPrice',
        args: [cardId],
      });

      const [price, timestamp, confidence] = result as any[];

      return {
        price,
        timestamp,
        confidence,
      };
    } catch (error) {
      console.error('Error fetching price:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get latest price (doesn't revert if not found)
   */
  const getLatestPrice = async (cardId: string): Promise<string> => {
    if (!publicClient) return '0';

    try {
      const price = await publicClient.readContract({
        address: contractAddress,
        abi: PriceOracleABI.abi,
        functionName: 'getLatestPrice',
        args: [cardId],
      });

      return formatEther(price as bigint);
    } catch (error) {
      console.error('Error fetching latest price:', error);
      return '0';
    }
  };

  /**
   * Get price history for a card
   */
  const getPriceHistory = async (cardId: string): Promise<PricePoint[]> => {
    if (!publicClient) return [];

    setLoading(true);
    try {
      const history = await publicClient.readContract({
        address: contractAddress,
        abi: PriceOracleABI.abi,
        functionName: 'getPriceHistory',
        args: [cardId],
      });

      return history as PricePoint[];
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get average price over N periods
   */
  const getAveragePrice = async (cardId: string, periods: number): Promise<string> => {
    if (!publicClient) return '0';

    try {
      const avgPrice = await publicClient.readContract({
        address: contractAddress,
        abi: PriceOracleABI.abi,
        functionName: 'getAveragePrice',
        args: [cardId, BigInt(periods)],
      });

      return formatEther(avgPrice as bigint);
    } catch (error) {
      console.error('Error fetching average price:', error);
      return '0';
    }
  };

  /**
   * Check if price is stale
   */
  const isPriceStale = async (cardId: string, maxAgeSeconds: number): Promise<boolean> => {
    if (!publicClient) return true;

    try {
      const isStale = await publicClient.readContract({
        address: contractAddress,
        abi: PriceOracleABI.abi,
        functionName: 'isPriceStale',
        args: [cardId, BigInt(maxAgeSeconds)],
      });

      return isStale as boolean;
    } catch (error) {
      console.error('Error checking price staleness:', error);
      return true;
    }
  };

  return {
    getPrice,
    getLatestPrice,
    getPriceHistory,
    getAveragePrice,
    isPriceStale,
    loading,
  };
}
