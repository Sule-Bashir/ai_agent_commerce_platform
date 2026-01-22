ai_agent_commerce_platform
AI Agent Commerce Platform for the Arc Hackathon. Demonstrates autonomous HTTP 402 micropayments with USDC on Arc Testnet.
# 🤖 AI Agent Commerce Platform

**Built for the "Agentic Commerce on Arc" Hackathon**  
*Demonstrating autonomous HTTP 402 micropayments with USDC on Arc Testnet*
[![Live Demo])
https://a1c7c916-3118-4c87-99b8-7a0dffdd3414-00-kntziqybqlpu.janeway.replit.dev/

https://replit.com/@sulebashir001/aiagentcommerceplatformNew
Copy the first URL into Metamask App browser, connect wallet, Update it RPC and get started 
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Hackathon](https://img.shields.io/badge/hackathon-Arc%20%2B%20Circle-orange)](https://lablab.ai)

A functional prototype showcasing how AI agents can autonomously purchase APIs and data using the HTTP 402 payment standard and USDC on the Arc blockchain.

## 🎯 Hackathon Alignment

| Track | How This Project Demonstrates It |
|-------|-----------------------------------|
| **🪙 Best Gateway-Based Micropayments** | Full HTTP 402 "Payment Required" flow with real USDC transactions |
| **🤖 Best Trustless AI Agent** | Autonomous wallet management and transaction signing |
| **🛒 Best Autonomous Commerce** | Machine-to-machine marketplace for digital services |
| **🧱 Best App Builder Application** | Built using Circle's Origin AI App Builder |

## 🚀 Live Demo

**Experience the demo:** [Live App on Replit](https://a1c7c916-3118-4c87-99b8-7a0dffdd3414-00-kntziqybqlpu.janeway.replit.dev/)
https://replit.com/@sulebashir001/aiagentcommerceplatformNew

Copy the first URL into Metamask App browser, connect wallet, Update it RPC and get started 

## 📱 App Usage Instructions

### 1. **Connect Your Wallet**
- Open the app in **MetaMask Mobile Browser** (recommended) or any Web3-enabled browser
- Click **"Connect Wallet"**
- Ensure your wallet is connected to **Arc Testnet** (Chain ID: 5042002)

### 2. **Get Testnet USDC**
1. Visit [Circle Testnet Faucet](https://faucet.circle.com)
2. Select **Arc Testnet**
3. Enter your wallet address
4. Request testnet USDC (takes 1-2 minutes)

### 3. **Experience the Agentic Commerce Flow**

#### Step 1: Select a Service
- Choose from available AI services (GPT-4, Image Generation, Data Analysis, Code Review)
- Each service has a price in USDC (0.10–0.25 USDC)

#### Step 2: Trigger HTTP 402 Response
- Click **"Request Service (Agent Will Pay)"**
- The app simulates a backend API returning **"402 Payment Required"**
- Payment details appear with amount, chain, and reference ID

#### Step 3: Autonomous Payment Execution
- Click **"Approve Payment (Agent Will Execute)"**
- **MetaMask pops up** – approve the transaction
- The AI agent autonomously signs and sends the USDC payment

#### Step 4: Service Delivery
- Transaction confirms on Arc Testnet (10-30 seconds)
- Service is "delivered" to the agent
- Activity log shows the complete transaction flow

### 4. **Monitor Transactions**
- Check real transactions on [Arc Testnet Explorer](https://testnet.arcscan.com)
- View the Activity Log in the app for step-by-step tracking

## 🏗️ Project Structure
src/
├── components/ # React UI components
│ ├── ServiceSelector.tsx # Service marketplace
│ ├── PaymentFlow.tsx # 402 payment flow visualization
│ ├── WalletConnect.tsx # Wallet connection logic
│ └── ActivityLog.tsx # Transaction history
├── lib/
│ ├── config.ts # wagmi/viem Arc Testnet configuration
│ ├── http402.ts # HTTP 402 protocol simulation
│ └── constants.ts # Service definitions & constants
├── App.tsx # Main application component
└── main.tsx # React entry point

## 🔧 Technical Implementation

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: wagmi + viem + Circle SDKs
- **Styling**: Tailwind CSS
- **Hosting**: Replit (live demo)
- **Blockchain**: Arc Testnet with USDC
- Wallet| MetaMask (Circle-compatible) 
## 📝 Circle Product Feedback

*(Required for hackathon submission – include this section in your lablab.ai description)*

**Products Used:** Arc Testnet, USDC, Circle's App Builder (Origin)

**What Worked Well:**
- Arc's EVM compatibility made integration with existing Ethereum tooling seamless
- Circle's App Builder (Origin) enabled rapid prototyping of a functional frontend in minutes
- The HTTP 402 standard provided a clean abstraction for machine-to-machine payments

**Recommendations for Improvement:**
- More example implementations of complete 402 payment flows
- Enhanced testnet faucet accessibility during hackathons
- Developer tools for simulating agent payment scenarios

## 🔗 Links

- **Live Demo**: [Replit App](https://a1c7c916-3118-4c87-99b8-7a0dffdd3414-00-kntziqybqlpu.janeway.replit.dev/)
- **Video Demo
-  https://www.loom.com/share/48be0272e1c64a4286942aa029d74ee6
- **Hackathon Page**: [Agentic Commerce on Arc](https://lablab.ai)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Built for the Agentic Commerce on Arc Hackathon • Powered by Circle & Arc Testnet
