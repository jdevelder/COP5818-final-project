import { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress } from '@/config/contracts';
import FuturesContractABI from '@/contracts/FuturesContract.json';
import toast from 'react-hot-toast';

export type PositionType = 0 | 1; // 0 = LONG, 1 = SHORT

export interface FuturesPosition {
  positionId: bigint;
  trader: string;
  cardId: string;
  positionType: PositionType;
  strikePrice: bigint;
  quantity: bigint;
  collateral: bigint;
  expiryDate: bigint;
  status: number;
  currentPnL: bigint;
}

export function useFutures() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  const chainId = chain?.id || 1337;
  const contractAddress = getContractAddress(chainId, 'FuturesContract') as `0x${string}`;

  /**
   * Open a new futures position
   */
  const openPosition = async (
    cardId: string,
    positionType: PositionType,
    strikePrice: string,
    quantity: number,
    durationDays: number
  ) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const duration = BigInt(durationDays * 24 * 60 * 60); // Convert days to seconds
      const strikePriceWei = parseEther(strikePrice);

      // Calculate required collateral (20% of strike * quantity)
      const collateralRatio = 20n;
      const requiredCollateral = (strikePriceWei * BigInt(quantity) * collateralRatio) / 100n;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: FuturesContractABI.abi,
        functionName: 'openPosition',
        args: [cardId, positionType, strikePriceWei, BigInt(quantity), duration],
        value: requiredCollateral,
      });

      toast.loading('Opening position...', { id: hash });

      await publicClient?.waitForTransactionReceipt({ hash });

      toast.success('Position opened successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error opening position:', error);
      toast.error(error.message || 'Failed to open position');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Settle a futures position
   */
  const settlePosition = async (positionId: number) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: FuturesContractABI.abi,
        functionName: 'settlePosition',
        args: [BigInt(positionId)],
      });

      toast.loading('Settling position...', { id: hash });

      await publicClient?.waitForTransactionReceipt({ hash });

      toast.success('Position settled successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error settling position:', error);
      toast.error(error.message || 'Failed to settle position');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user's positions
   */
  const getUserPositions = async (userAddress: string): Promise<bigint[]> => {
    if (!publicClient) return [];

    try {
      const positions = await publicClient.readContract({
        address: contractAddress,
        abi: FuturesContractABI.abi,
        functionName: 'getTraderPositions',
        args: [userAddress as `0x${string}`],
      });

      return positions as bigint[];
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  };

  /**
   * Get position details
   */
  const getPosition = async (positionId: number): Promise<FuturesPosition | null> => {
    if (!publicClient) return null;

    try {
      const position = await publicClient.readContract({
        address: contractAddress,
        abi: FuturesContractABI.abi,
        functionName: 'getPosition',
        args: [BigInt(positionId)],
      });

      const [trader, cardId, positionType, strikePrice, quantity, collateral, expiryDate, status, currentPnL] =
        position as any[];

      return {
        positionId: BigInt(positionId),
        trader,
        cardId,
        positionType,
        strikePrice,
        quantity,
        collateral,
        expiryDate,
        status,
        currentPnL,
      };
    } catch (error) {
      console.error('Error fetching position:', error);
      return null;
    }
  };

  /**
   * Calculate required collateral
   */
  const calculateRequiredCollateral = async (strikePrice: string, quantity: number): Promise<string> => {
    if (!publicClient) return '0';

    try {
      const strikePriceWei = parseEther(strikePrice);
      const collateral = await publicClient.readContract({
        address: contractAddress,
        abi: FuturesContractABI.abi,
        functionName: 'calculateRequiredCollateral',
        args: [strikePriceWei, BigInt(quantity)],
      });

      return formatEther(collateral as bigint);
    } catch (error) {
      console.error('Error calculating collateral:', error);
      return '0';
    }
  };

  return {
    openPosition,
    settlePosition,
    getUserPositions,
    getPosition,
    calculateRequiredCollateral,
    loading,
  };
}
