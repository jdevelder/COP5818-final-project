# Getting Started with TCG Derivatives Trading Platform

This guide will help you set up and run the TCG Derivatives Trading Platform locally.

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- MetaMask or compatible Web3 wallet
- Basic understanding of blockchain and derivatives trading

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

Copy the `.env.example` file to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Add your private key (for testnet deployment only)
- Add RPC URLs (Infura, Alchemy, etc.)
- Configure backend settings

### 3. Compile Smart Contracts

```bash
npx hardhat compile
```

This will compile all Solidity contracts and generate artifacts.

### 4. Run Local Blockchain

In a separate terminal, start a local Hardhat node:

```bash
npx hardhat node
```

This creates a local blockchain with test accounts.

### 5. Deploy Contracts

Deploy contracts to the local network:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Save the deployed contract addresses for the frontend configuration.

### 6. Start Backend Server

In a new terminal:

```bash
cd backend
npm run dev
```

The API will run on http://localhost:3001

### 7. Start Frontend

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:3000

## Usage

### Connecting Your Wallet

1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet"
3. Select MetaMask and approve the connection
4. Make sure you're connected to the correct network (Localhost:8545 for local development)

### Trading Derivatives

#### Futures Trading
1. Navigate to the "Futures" section
2. Select a card from the dropdown
3. Choose Long (bullish) or Short (bearish)
4. Enter strike price, quantity, and expiry
5. Review the risk summary
6. Click "Open Position" and confirm the transaction

#### Options Trading
1. Go to the "Options" section
2. Choose Call (right to buy) or Put (right to sell)
3. Set strike price and premium
4. Select expiry date
5. Pay premium to purchase the option
6. Exercise the option if it's profitable

#### Swaps Trading
1. Navigate to "Swaps"
2. Select two cards to swap (Card A and Card B)
3. Set notional values for each
4. Choose maturity date
5. Deposit collateral
6. Wait for a counterparty to accept your swap

### Monitoring Positions

- View all your active positions in the dashboard
- Check unrealized P&L in real-time
- Monitor expiry dates
- Settle or close positions as needed

## Testing

Run the test suite:

```bash
npx hardhat test
```

## Deployment to Testnet

### 1. Get Testnet ETH

Get free testnet ETH from faucets:
- Sepolia: https://sepoliafaucet.com/
- Goerli: https://goerlifaucet.com/

### 2. Update Environment

Update your `.env` with testnet configuration:
```
SEPOLIA_RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
```

### 3. Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Project Structure

```
blockchaintradingplatform/
├── contracts/              # Solidity smart contracts
│   ├── TCGCardToken.sol
│   ├── PriceOracle.sol
│   ├── FuturesContract.sol
│   ├── OptionsContract.sol
│   └── SwapsContract.sol
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── styles/        # CSS styles
│   └── package.json
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   └── index.js       # Server entry point
│   └── package.json
├── scripts/                # Deployment scripts
│   └── deploy.js
└── test/                   # Contract tests
```

## Key Concepts

### Futures
- **Long Position**: Profit when price goes up
- **Short Position**: Profit when price goes down
- **Collateral**: Required to open position (typically 20% of notional value)
- **Settlement**: Automatic at expiry date

### Options
- **Call Option**: Right to buy at strike price
- **Put Option**: Right to sell at strike price
- **Premium**: Price paid for the option
- **Exercise**: Use your right to buy/sell
- **Expiry**: Options expire if not exercised

### Swaps
- **Party A & B**: Two traders exchanging cash flows
- **Notional Values**: Size of the position for each party
- **Maturity**: Settlement date
- **Net Settlement**: Only the difference is paid at maturity

## Troubleshooting

### Contract Deployment Issues
- Ensure you have enough ETH for gas
- Check that your RPC URL is correct
- Verify your private key is properly set

### Frontend Connection Issues
- Make sure MetaMask is connected to the correct network
- Check that contract addresses are correctly configured
- Clear cache and reload the page

### Transaction Failures
- Ensure you have approved sufficient collateral
- Check that prices are not stale in the oracle
- Verify position hasn't expired

## Support

For issues or questions:
- Check the README.md
- Review the contract documentation
- Open an issue on GitHub

## Security Note

- Never commit private keys to version control
- Use testnet for development
- Audit contracts before mainnet deployment
- Be cautious with real funds
