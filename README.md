# Tiply - Web3 Tipping Platform on Solana 🚀

![Tiply Logo](https://github.com/eimaam/tiply/blob/dev/client/src/assets/images/tiply-logo.png?raw=true)

## 🏆 SOLANA BREAKOUT HACKATHON - COLOSSEUM Entry

Tiply is a decentralized tipping platform built on Solana that enables seamless USDC-based tipping between creators and their supporters. With a beautiful, customizable interface and robust transaction handling, Tiply makes Web3 tipping accessible and enjoyable.

## 🚨 The Problem

Most creator tipping tools are either centralized (with high fees and payout limits) or too technical for the average fan. They often require:

- Wallet connection
- App download or platform signups
- Complex on-chain actions

These roadblocks limit spontaneous tipping and reduce creator earnings.

---

## 💡 Our Solution

**Tiply makes tipping feel like liking a post.**

- ✅ **No login required** for tippers
- ✅ **Anonymous tips**, with optional notes
- ✅ **Unique profile links** (e.g. `usetiply.xyz/@username`)
- ✅ **USDC on Solana** = fast, stable, low fees
- ✅ **Auto-generated custodial wallets** via **Circle**

It’s built to work anywhere — Twitter, Instagram, YouTube, or wherever creators live online.

---

### 🌟 Key Features

- **Instant USDC Tipping**: Send tips using USDC on Solana with near-instant finality
- **Customizable Creator Profiles**: Personalized profiles with custom themes, tip amounts, and social links
- **Circle Integration**: Leveraging Circle's USDC infrastructure for secure transactions
- **Beautiful UI/UX**: Modern, responsive design with dark mode support
- **Real-time Transaction Tracking**: Live status updates and transaction confirmations
- **Wallet Integration**: Seamless connection with Solana wallets
- **Developer-Controlled Wallets**: Secure wallet management using Circle's SDK

## 🌍 Real-World Potential

Tiply isn’t just for hackathons — it's designed for scale:

- ✨ Anyone with a username can receive tips
- 📊 Built-in support for creator analytics
- 🔄 Future support for withdrawals, subs, crowdfunding
- 🔌 Easy integrations with social platforms

This is the easiest way for anyone, anywhere, to support creators.

---

## 🧠 Core MVP Features

- Creator onboarding with auto-wallet creation
- Public tip page (`usetiply.xyz/username`)
- Preset and custom tip amounts
- Optional message with each tip
- Fully anonymous tipping
- Deposit routed via Circle to the creator’s custodial wallet
- Styled with TailwindCSS, Ant Design, and animated via Framer Motion

---

## 🛠 Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Ant Design Components
- Framer Motion for animations
- Solana Web3.js
- Circle SDK

### Backend
- Node.js + Express
- TypeScript
- MongoDB
- Circle API Integration
- JWT Authentication

### Blockchain
- Solana Network
- USDC Token Integration
- SPL Token Program

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Solana CLI Tools
- Circle Developer Account

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/eimaam/tiply.git
cd tiply
\`\`\`

2. Install dependencies:
\`\`\`bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
\`\`\`

3. Set up environment variables:

Frontend (.env):
\`\`\`env
VITE_API_URL=http://localhost:8000/api/v1
VITE_USDC_MINT=your_usdc_mint_address
\`\`\`

Backend (.env):
\`\`\`env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CIRCLE_API_KEY=your_circle_api_key
\`\`\`

4. Run the development servers:

\`\`\`bash
# Start frontend
cd client
npm run dev

# Start backend
cd server
npm run dev
\`\`\`

## 🎯 Core Features

### For Creators
- Customizable profile pages
- Multiple tipping options
- Social media integration
- Transaction history
- Withdrawal management
- Analytics dashboard

### For Supporters
- Easy-to-use tipping interface
- Multiple payment amounts
- Transaction status tracking
- Personal message with tips

## 🔒 Security Features

- JWT-based authentication
- Circle's secure wallet infrastructure
- Rate limiting
- Input sanitization
- Role-based access control
- Secure transaction handling

## 🌐 API Endpoints

### Authentication
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh-token

### Transactions
- POST /api/v1/transactions/withdraw
- GET /api/v1/transactions/status/:id
- POST /api/v1/tips/submit

### Users
- GET /api/v1/users/profile/:username
- PUT /api/v1/users/profile
- PUT /api/v1/users/customization

## 🎨 UI/UX Features

- Responsive design
- Dark/Light mode
- Animated transitions
- Loading states
- Error handling
- Toast notifications
- Confetti celebrations
- Progress tracking

## 🔄 Transaction Flow

1. User connects wallet
2. Selects tip amount
3. Confirms transaction
4. Signs with wallet
5. Transaction processing
6. Backend validation
7. Status updates
8. Success confirmation

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Basic tipping functionality
- ✅ Creator profiles
- ✅ USDC integration
- ✅ Transaction tracking

### Phase 2
- 🔄 Multi-token support
- 🔄 Subscription model
- 🔄 Mobile app
- 🔄 Advanced analytics

### Phase 3
- 📋 DAO integration
- 📋 NFT rewards
- 📋 Cross-chain support
- 📋 Creator marketplace

## 👥 Team

- [Imam Dahir Dan-Azumi] - Full Stack Developer & Project Lead


## 🙏 Acknowledgments
Built for the **Solana Breakout Hackathon 2025** — powered by Circle, Solana, and designed to support creators around the world.

- Solana Foundation
- Circle Team
- SuperTeam
- COLOSSEUM Organizers
- Hackathon Mentors
- Open Source Community


## 📞 Contact

For questions or support, reach out to us:
- Email: [immamddahir@gmail.com]
- Twitter: [@tiplyHQ]

---

Built with ❤️ for the SOLANA BREAKOUT HACKATHON 