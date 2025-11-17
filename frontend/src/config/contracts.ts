// Contract addresses - Update these after deployment
export const CONTRACT_ADDRESSES = {
  localhost: {
    TCGCardToken: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TOKEN || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    PriceOracle: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ORACLE || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    FuturesContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_FUTURES || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    OptionsContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIONS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    SwapsContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SWAPS || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  },
  sepolia: {
    TCGCardToken: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TOKEN || '',
    PriceOracle: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ORACLE || '',
    FuturesContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_FUTURES || '',
    OptionsContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPTIONS || '',
    SwapsContract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_SWAPS || '',
  },
};

// Get contract address based on chain ID
export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES.localhost) {
  if (chainId === 1337 || chainId === 31337) {
    return CONTRACT_ADDRESSES.localhost[contractName];
  } else if (chainId === 11155111) {
    return CONTRACT_ADDRESSES.sepolia[contractName];
  }
  return CONTRACT_ADDRESSES.localhost[contractName];
}
