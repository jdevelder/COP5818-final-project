import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, localhost, sepolia, mainnet } from 'wagmi/chains';

// Configure chains
export const chains = [hardhat, localhost, sepolia, mainnet] as const;

// Wagmi configuration
export const config = getDefaultConfig({
  appName: 'TCG Derivatives Trading',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: chains,
  ssr: true, // If using server-side rendering
});
