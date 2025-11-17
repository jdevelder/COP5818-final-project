# 🧪 Local Testing Guide

## Complete Step-by-Step Instructions

### Prerequisites Check ✅
```bash
node --version  # Should be v16+
npm --version   # Should be v8+
```

---

## Step 1: Install Dependencies (5-10 minutes)

### Root Directory
```bash
cd blockchaintradingplatform
npm install
```

### Frontend
```bash
cd frontend
npm install
cd ..
```

### Backend
```bash
cd backend
npm install
cd ..
```

**Expected Output:** No errors, all dependencies installed

---

## Step 2: Compile Smart Contracts (2-3 minutes)

```bash
npx hardhat compile
```

**Expected Output:**
```
Compiled 5 Solidity files successfully
```

**Troubleshooting:**
- If you see "Stack too deep" error - Already fixed with viaIR: true
- If compilation fails, try: `npx hardhat clean && npx hardhat compile`

---

## Step 3: Start Local Blockchain (Terminal 1)

```bash
npx hardhat node
```

**Expected Output:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...
```

**✅ Leave this terminal running!**

**Important:**
- Copy Account #0 address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Copy Private Key for Account #0 (shown in terminal)

---

## Step 4: Deploy Contracts (Terminal 2 - New Terminal)

```bash
cd blockchaintradingplatform
npx hardhat run scripts/deploy.js --network localhost
```

**Expected Output:**
```
Deploying TCG Derivatives Trading Platform...

TCGCardToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
PriceOracle deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
FuturesContract deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
OptionsContract deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
SwapsContract deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

Test cards minted!
Initial prices set!

Deployment completed successfully!
```

**✅ Note the contract addresses - they're saved to `deployments-localhost.json`**

---

## Step 5: Generate ABIs for Frontend

```bash
node scripts/generateABIs.js
```

**Expected Output:**
```
Generating ABIs for frontend...

✅ Generated ABI for TCGCardToken
✅ Generated ABI for PriceOracle
✅ Generated ABI for FuturesContract
✅ Generated ABI for OptionsContract
✅ Generated ABI for SwapsContract

✨ ABI generation complete!
```

**This creates:** `/frontend/src/contracts/*.json` files

---

## Step 6: Start Backend (Terminal 3 - New Terminal)

```bash
cd blockchaintradingplatform/backend
npm run dev
```

**Expected Output:**
```
Server running on port 3001
Environment: development
```

**✅ Backend running at http://localhost:3001**

**Test it:**
```bash
curl http://localhost:3001
# Should return: {"message":"TCG Derivatives Trading Platform API",...}
```

---

## Step 7: Start Frontend (Terminal 4 - New Terminal)

```bash
cd blockchaintradingplatform/frontend
npm run dev
```

**Expected Output:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
...
✓ Compiled in Xms
```

**✅ Frontend running at http://localhost:3000**

---

## Step 8: Configure MetaMask

### Add Localhost Network
1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Click "Add a network manually"
4. Enter:
   - **Network Name:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH
5. Click "Save"

### Import Test Account
1. Click account icon → "Import Account"
2. Select "Private Key"
3. Paste the private key from Step 3 (Account #0)
4. Click "Import"

**You should see: ~10,000 ETH balance**

---

## Step 9: Test the Platform! 🎉

### A. Connect Wallet
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select MetaMask
4. Select "Localhost 8545" network
5. Click "Connect"

**✅ You should see your address in the header**

---

### B. Test Trading Features

#### Test 1: View Cards
1. Go to home page
2. Scroll down
3. You should see the beautiful gamified UI

#### Test 2: Open a Futures Position
1. Click "Trade" or go to http://localhost:3000/trade
2. Select "Futures"
3. Fill in the form:
   - **Card:** Charizard-BaseSet-Rare
   - **Position:** LONG
   - **Strike Price:** 12
   - **Quantity:** 1
   - **Duration:** 7 days
4. Click "Open Position"
5. Approve transaction in MetaMask
6. Wait for confirmation

**Expected:** Green toast notification "Position opened successfully!"

#### Test 3: View Positions
1. Scroll down on trade page
2. You should see your active position
3. Shows card name, type (LONG), P&L, expiry

#### Test 4: View Analytics
1. Go to http://localhost:3000/analytics
2. You should see:
   - Total P&L stat
   - Win Rate
   - Portfolio chart
   - Position breakdown chart
   - Daily P&L chart

#### Test 5: Check Achievements
1. Go to http://localhost:3000/achievements
2. You should see:
   - Your level and XP
   - Achievement list
   - Some unlocked (like "First Steps")
   - Progress bars

#### Test 6: View Leaderboard
1. Go to http://localhost:3000/leaderboard
2. You should see:
   - Top 10 traders
   - Rank badges (gold, silver, bronze)
   - Your rank at bottom

---

### C. Test Mobile View

1. Open Chrome DevTools (F12)
2. Click device toolbar (or Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Refresh page

**You should see:**
- ✅ Mobile navigation at bottom
- ✅ Hamburger menu at top
- ✅ Responsive cards and layouts
- ✅ Touch-friendly buttons

---

## 🧪 Advanced Testing

### Test Price Charts
1. Go to trade page
2. The price should show for selected cards
3. Charts display price history

### Test Options Trading
1. Go to trade page
2. Select "Options" tab
3. Try creating a Call option
4. Set strike price, premium, duration
5. Click "Create Option"

### Test Swaps Trading
1. Go to trade page
2. Select "Swaps" tab
3. Propose a swap between two cards
4. Set notional values and duration
5. Click "Propose Swap"

---

## 📊 What to Test

### Checklist:
- [ ] Wallet connects
- [ ] Network switches to localhost
- [ ] Balance shows in wallet button
- [ ] Can navigate all pages
- [ ] Trade page loads
- [ ] Can open futures position
- [ ] Position appears in list
- [ ] Analytics page shows charts
- [ ] Achievements page loads
- [ ] Leaderboard displays
- [ ] Mobile navigation works
- [ ] Cards display with images
- [ ] Animations are smooth
- [ ] Toast notifications appear
- [ ] Transaction confirmations work

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to localhost:8545"
**Solution:** Make sure Terminal 1 (hardhat node) is running

### Issue: "Contract not deployed"
**Solution:**
```bash
# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
```

### Issue: "ABI files not found"
**Solution:**
```bash
node scripts/generateABIs.js
```

### Issue: Frontend won't start
**Solution:**
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: Transaction fails
**Solution:**
1. Reset MetaMask account:
   - Settings → Advanced → Clear activity tab data
2. Restart hardhat node (Terminal 1)
3. Redeploy contracts (Terminal 2)

### Issue: "Insufficient funds"
**Solution:** Make sure you imported Account #0 with 10,000 ETH

### Issue: Cards not showing images
**Solution:**
- Check internet connection (images load from external URLs)
- Images are from real TCG APIs and should load

---

## 🎯 Testing Scenarios

### Scenario 1: Complete Trading Flow
1. Connect wallet ✅
2. Open futures position ✅
3. View position in list ✅
4. Check analytics dashboard ✅
5. Earn "First Steps" achievement ✅

### Scenario 2: Multiple Positions
1. Open 3 different positions (futures, options, swap)
2. View all in positions list
3. Check position breakdown chart
4. Earn "Active Trader" achievement

### Scenario 3: Mobile Experience
1. Switch to mobile view
2. Use bottom navigation
3. Open side menu
4. Place a trade
5. View positions

---

## 📸 What You Should See

### Home Page
- Beautiful gradient background
- TCG Derivatives header
- Three cards (Futures, Options, Swaps)
- Stats section
- Smooth animations

### Trade Page
- Derivative type selector (left sidebar)
- Trading form (center)
- Risk summary
- Position list (bottom)

### Analytics Page
- 4 key metric cards
- Portfolio value chart
- Position breakdown pie chart
- Daily P&L bar chart
- Performance comparison

### Achievements Page
- Level and XP display with progress bar
- Achievement grid with rarity colors
- Unlocked achievements glow
- Filters working

### Leaderboard Page
- Top 10 traders with rank badges
- Gold/silver/bronze for top 3
- Stats for each trader
- Your rank at bottom

---

## ✅ Success Criteria

You'll know everything is working when:
1. ✅ All 4 terminals running without errors
2. ✅ Wallet connects to localhost
3. ✅ Can open a position
4. ✅ Position shows in list with P&L
5. ✅ Analytics page displays charts
6. ✅ Achievements page loads
7. ✅ Leaderboard shows traders
8. ✅ Mobile navigation works
9. ✅ No console errors in browser
10. ✅ Toast notifications appear

---

## 🎉 You're Testing!

Once all terminals are running and you can:
- Connect wallet
- See your positions
- View charts
- Navigate all pages

**You're successfully running the complete TCG Derivatives Trading Platform locally!** 🚀

---

## 📝 Notes

- **Test ETH:** You have 10,000 ETH on localhost - use freely!
- **Reset:** Restart hardhat node to reset blockchain state
- **Contracts:** Addresses change each time you restart hardhat
- **ABIs:** Regenerate if you recompile contracts

---

## 🆘 Need Help?

Check the browser console (F12) for errors. Most issues are:
1. Hardhat node not running
2. Contracts not deployed
3. ABIs not generated
4. Wrong network in MetaMask

Fix by running steps 3, 4, and 5 again.

---

**Happy Testing! Let me know what you see!** 🎮
