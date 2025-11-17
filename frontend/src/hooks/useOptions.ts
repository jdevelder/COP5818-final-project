import { useState } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress } from '@/config/contracts';
import OptionsContractABI from '@/contracts/OptionsContract.json';
import toast from 'react-hot-toast';

export type OptionType = 0 | 1; // 0 = CALL, 1 = PUT

export interface Option {
  optionId: bigint;
  buyer: string;
  seller: string;
  cardId: string;
  optionType: OptionType;
  strikePrice: bigint;
  premium: bigint;
  quantity: bigint;
  expiryDate: bigint;
  status: number;
}

export function useOptions() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  const chainId = chain?.id || 1337;
  const contractAddress = getContractAddress(chainId, 'OptionsContract') as `0x${string}`;

  /**
   * Create (sell) an option
   */
  const createOption = async (
    cardId: string,
    optionType: OptionType,
    strikePrice: string,
    premium: string,
    quantity: number,
    durationDays: number
  ) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const duration = BigInt(durationDays * 24 * 60 * 60);
      const strikePriceWei = parseEther(strikePrice);
      const premiumWei = parseEther(premium);

      // Calculate required collateral (100% of strike * quantity)
      const requiredCollateral = strikePriceWei * BigInt(quantity);

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'createOption',
        args: [cardId, optionType, strikePriceWei, premiumWei, BigInt(quantity), duration],
        value: requiredCollateral,
      });

      toast.loading('Creating option...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Option created successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error creating option:', error);
      toast.error(error.message || 'Failed to create option');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Purchase an option
   */
  const purchaseOption = async (optionId: number, premium: string) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const premiumWei = parseEther(premium);

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'purchaseOption',
        args: [BigInt(optionId)],
        value: premiumWei,
      });

      toast.loading('Purchasing option...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Option purchased successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error purchasing option:', error);
      toast.error(error.message || 'Failed to purchase option');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exercise an option
   */
  const exerciseOption = async (optionId: number) => {
    if (!walletClient || !address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'exerciseOption',
        args: [BigInt(optionId)],
      });

      toast.loading('Exercising option...', { id: hash });
      await publicClient?.waitForTransactionReceipt({ hash });
      toast.success('Option exercised successfully!', { id: hash });
      return hash;
    } catch (error: any) {
      console.error('Error exercising option:', error);
      toast.error(error.message || 'Failed to exercise option');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get buyer's options
   */
  const getBuyerOptions = async (userAddress: string): Promise<bigint[]> => {
    if (!publicClient) return [];

    try {
      const options = await publicClient.readContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'getBuyerOptions',
        args: [userAddress as `0x${string}`],
      });

      return options as bigint[];
    } catch (error) {
      console.error('Error fetching buyer options:', error);
      return [];
    }
  };

  /**
   * Get seller's options
   */
  const getSellerOptions = async (userAddress: string): Promise<bigint[]> => {
    if (!publicClient) return [];

    try {
      const options = await publicClient.readContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'getSellerOptions',
        args: [userAddress as `0x${string}`],
      });

      return options as bigint[];
    } catch (error) {
      console.error('Error fetching seller options:', error);
      return [];
    }
  };

  /**
   * Get option details
   */
  const getOption = async (optionId: number): Promise<Option | null> => {
    if (!publicClient) return null;

    try {
      const option = await publicClient.readContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'getOption',
        args: [BigInt(optionId)],
      });

      const [buyer, seller, cardId, optionType, strikePrice, premium, quantity, expiryDate, status] = option as any[];

      return {
        optionId: BigInt(optionId),
        buyer,
        seller,
        cardId,
        optionType,
        strikePrice,
        premium,
        quantity,
        expiryDate,
        status,
      };
    } catch (error) {
      console.error('Error fetching option:', error);
      return null;
    }
  };

  /**
   * Check if option is in the money
   */
  const isInTheMoney = async (optionId: number): Promise<boolean> => {
    if (!publicClient) return false;

    try {
      const result = await publicClient.readContract({
        address: contractAddress,
        abi: OptionsContractABI.abi,
        functionName: 'isInTheMoney',
        args: [BigInt(optionId)],
      });

      return result as boolean;
    } catch (error) {
      console.error('Error checking if in the money:', error);
      return false;
    }
  };

  return {
    createOption,
    purchaseOption,
    exerciseOption,
    getBuyerOptions,
    getSellerOptions,
    getOption,
    isInTheMoney,
    loading,
  };
}
