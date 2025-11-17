import { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress } from '@/config/contracts';
import SwapsContractABI from '@/contracts/SwapsContract.json';
import toast from 'react-hot-toast';

export interface Swap {
  swapId: bigint;
  partyA: string;
  partyB: string;
  cardIdA: string;
  cardIdB: string;
  notionalValueA: bigint;
  notionalValueB: bigint;
  maturityDate: bigint;
  status: number;
  currentPnLA: bigint;
}

export function useSwaps() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  const chainId = chain?.id || 1337;
  const contractAddress = getContractAddress(chainId, 'SwapsContract') as `0x${string}`;

  /**
   * Propose a new swap
   */
  const proposeSwap = async (
    cardIdA: string,
    cardIdB: string,
    notionalValueA: string,
    notionalValueB: string,
    durationDays: number
  ) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const duration = BigInt(durationDays * 24 * 60 * 60);
      const notionalA = parseEther(notionalValueA);
      const notionalB = parseEther(notionalValueB);

      // Calculate required collateral (15% of notional value)
      const collateralRatio = 15n;
      const requiredCollateral = (notionalA * collateralRatio) / 100n;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'proposeSwap',
        args: [cardIdA, cardIdB, notionalA, notionalB, duration],
        value: requiredCollateral,
      });

      toast.loading('Proposing swap...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Swap proposed successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error proposing swap:', error);
      toast.error(error.message || 'Failed to propose swap');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Accept a proposed swap
   */
  const acceptSwap = async (swapId: number, notionalValueB: string) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const notionalB = parseEther(notionalValueB);
      const collateralRatio = 15n;
      const requiredCollateral = (notionalB * collateralRatio) / 100n;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'acceptSwap',
        args: [BigInt(swapId)],
        value: requiredCollateral,
      });

      toast.loading('Accepting swap...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Swap accepted successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error accepting swap:', error);
      toast.error(error.message || 'Failed to accept swap');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Settle a swap
   */
  const settleSwap = async (swapId: number) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'settleSwap',
        args: [BigInt(swapId)],
      });

      toast.loading('Settling swap...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Swap settled successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error settling swap:', error);
      toast.error(error.message || 'Failed to settle swap');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel a pending swap
   */
  const cancelSwap = async (swapId: number) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'cancelSwap',
        args: [BigInt(swapId)],
      });

      toast.loading('Cancelling swap...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Swap cancelled successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error cancelling swap:', error);
      toast.error(error.message || 'Failed to cancel swap');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user's swaps
   */
  const getUserSwaps = async (userAddress: string): Promise<bigint[]> => {
    if (!publicClient) return [];

    try {
      const swaps = await publicClient.readContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'getUserSwaps',
        args: [userAddress as `0x${string}`],
      });

      return swaps as bigint[];
    } catch (error) {
      console.error('Error fetching swaps:', error);
      return [];
    }
  };

  /**
   * Get swap details
   */
  const getSwap = async (swapId: number): Promise<Swap | null> => {
    if (!publicClient) return null;

    try {
      const swap = await publicClient.readContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'getSwap',
        args: [BigInt(swapId)],
      });

      const [partyA, partyB, cardIdA, cardIdB, notionalValueA, notionalValueB, maturityDate, status, currentPnLA] =
        swap as any[];

      return {
        swapId: BigInt(swapId),
        partyA,
        partyB,
        cardIdA,
        cardIdB,
        notionalValueA,
        notionalValueB,
        maturityDate,
        status,
        currentPnLA,
      };
    } catch (error) {
      console.error('Error fetching swap:', error);
      return null;
    }
  };

  /**
   * Get active swaps available for matching
   */
  const getActiveSwaps = async (offset: number = 0, limit: number = 10): Promise<bigint[]> => {
    if (!publicClient) return [];

    try {
      const swaps = await publicClient.readContract({
        address: contractAddress,
        abi: SwapsContractABI.abi,
        functionName: 'getActiveSwaps',
        args: [BigInt(offset), BigInt(limit)],
      });

      return swaps as bigint[];
    } catch (error) {
      console.error('Error fetching active swaps:', error);
      return [];
    }
  };

  return {
    proposeSwap,
    acceptSwap,
    settleSwap,
    cancelSwap,
    getUserSwaps,
    getSwap,
    getActiveSwaps,
    loading,
  };
}
