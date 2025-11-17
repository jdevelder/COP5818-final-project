import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { getContract } from 'viem';
import { getContractAddress } from '@/config/contracts';

// Import ABIs (these will be generated after compilation)
import TCGCardTokenABI from '@/contracts/TCGCardToken.json';
import PriceOracleABI from '@/contracts/PriceOracle.json';
import FuturesContractABI from '@/contracts/FuturesContract.json';
import OptionsContractABI from '@/contracts/OptionsContract.json';
import SwapsContractABI from '@/contracts/SwapsContract.json';

export function useContracts() {
  const { chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const chainId = chain?.id || 1337;

  // Get contract instances
  const getTCGCardToken = () => {
    const address = getContractAddress(chainId, 'TCGCardToken');
    return getContract({
      address: address as `0x${string}`,
      abi: TCGCardTokenABI.abi,
      client: { public: publicClient, wallet: walletClient },
    });
  };

  const getPriceOracle = () => {
    const address = getContractAddress(chainId, 'PriceOracle');
    return getContract({
      address: address as `0x${string}`,
      abi: PriceOracleABI.abi,
      client: { public: publicClient, wallet: walletClient },
    });
  };

  const getFuturesContract = () => {
    const address = getContractAddress(chainId, 'FuturesContract');
    return getContract({
      address: address as `0x${string}`,
      abi: FuturesContractABI.abi,
      client: { public: publicClient, wallet: walletClient },
    });
  };

  const getOptionsContract = () => {
    const address = getContractAddress(chainId, 'OptionsContract');
    return getContract({
      address: address as `0x${string}`,
      abi: OptionsContractABI.abi,
      client: { public: publicClient, wallet: walletClient },
    });
  };

  const getSwapsContract = () => {
    const address = getContractAddress(chainId, 'SwapsContract');
    return getContract({
      address: address as `0x${string}`,
      abi: SwapsContractABI.abi,
      client: { public: publicClient, wallet: walletClient },
    });
  };

  return {
    tcgCardToken: getTCGCardToken(),
    priceOracle: getPriceOracle(),
    futuresContract: getFuturesContract(),
    optionsContract: getOptionsContract(),
    swapsContract: getSwapsContract(),
  };
}
