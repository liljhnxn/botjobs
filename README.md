# BotJobs — Decentralized Web3 Jobs & Talent Marketplace on Botchain

BotJobs is a decentralized Web3 jobs and talent marketplace built natively for the **Botchain Mainnet (Chain ID 677)** ecosystem. It connects clients and Web3 builders through verifiable smart contracts, on-chain freelancer profiles, structured proposal workflows, and modular integration with **BotEscrow**, **BotRepute**, and **BotNS**.

---

## 1. Project Overview

BotJobs manages the decentralized marketplace layer:
- **Clients** create on-chain jobs, define BOT payment budgets, set application deadlines, review proposals, shortlist/reject/accept applicants, and track active agreements through completion.
- **Freelancers** publish sovereign on-chain talent profiles, browse open jobs, submit structured proposals, confirm hiring agreements, and build a tamper-proof on-chain work history.

### Non-Custodial Marketplace Boundary
BotJobs **never** custodies payment funds directly (`receive()` and `fallback()` revert with `PaymentCustodyNotAllowed`). Instead, payment custody, milestone locking, releases, refunds, and dispute resolution are delegated to **BotEscrow**.

---

## 2. Botchain Network Configuration

All network values are centralized in `hardhat.config.ts` and `frontend/config/network.ts`:

| Parameter | Value |
| :--- | :--- |
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Block Explorer** | `https://scan.botchain.ai` |
| **Native Token** | `BOT` |

The frontend strictly validates the connected wallet's network before any contract write and never silently falls back to another network.

---

## 3. Botchain Ecosystem Architecture

BotJobs is designed as a modular component of the broader Botchain protocol stack:

- **BotNS** → Decentralized identity (`.bot` name resolution)
- **BotJobs** → Job discovery, applications, hiring workflow, and talent marketplace
- **BotRepute** → Verifiable on-chain credentials (`Developer`, `Builder`, `Contributor`, `Creator`, `Project Contributor`)
- **BotEscrow** → Payment custody, milestones, releases, refunds, and disputes
- **BotPay** → Payment infrastructure
- **BotDAO** → Future decentralized governance
- **BotInsure** → Future parametric protection

---

## 4. Technology Stack

- **Smart Contracts**: Solidity `^0.8.24`, Hardhat, TypeScript, OpenZeppelin Contracts v5 (`AccessControl`, `Pausable`, `ReentrancyGuard`)
- **Testing**: Hardhat Toolbox, Mocha, Chai, Ethers v6, TypeChain
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, `wagmi` v2, `viem` v2, TanStack Query, Lucide Icons

---

## 5. Smart Contract Architecture & Input Limits

### Contract Files
- `contracts/BotJobs.sol` — Core marketplace smart contract
- `contracts/interfaces/IBotEscrow.sol` — Escrow custody integration interface
- `contracts/interfaces/IBotRepute.sol` — Verified credentials integration interface
- `contracts/interfaces/IBotNS.sol` — `.bot` domain resolution interface
- `contracts/mocks/MockBotEscrow.sol` — Automated testing mock for BotEscrow
- `contracts/mocks/MockBotRepute.sol` — Automated testing mock for BotRepute
- `contracts/mocks/MockBotNS.sol` — Automated testing mock for BotNS

### On-Chain Storage Limits (`BotJobs.sol`)
To prevent excessive gas consumption or storage abuse, `BotJobs.sol` enforces strict byte length bounds:
- `MAX_TITLE_LENGTH`: `120` bytes
- `MAX_DESCRIPTION_LENGTH`: `4000` bytes
- `MAX_PROPOSAL_LENGTH`: `3000` bytes
- `MAX_BIO_LENGTH`: `1000` bytes
- `MAX_HEADLINE_LENGTH`: `150` bytes
- `MAX_DISPLAY_NAME_LENGTH`: `80` bytes
- `MAX_SKILL_COUNT`: `25` skills per profile
- `MAX_SKILL_LENGTH`: `50` bytes per skill
- `MAX_URI_LENGTH`: `512` bytes
- `DEFAULT_HIRE_CONFIRMATION_TIMEOUT`: `3 days` (configurable between `1 hour` and `30 days`)

---

## 6. Lifecycle State Machines

### Job Lifecycle (`JobStatus`)
1. `OPEN` — Created by client via `createJob()`. Accepting freelancer applications before `applicationDeadline`.
2. `IN_REVIEW` — Transitioned when client shortlists an application via `shortlistApplication()`.
3. `HIRED` — Client accepts an application via `acceptApplication()`. Selected freelancer is assigned and competing pending/shortlisted applications are automatically rejected.
4. `IN_PROGRESS` — Selected freelancer confirms the hire via `confirmHire()`. (If the freelancer does not confirm within `hireConfirmationTimeout`, the client can call `cancelUnconfirmedHire()`).
5. `COMPLETED` — Client confirms completion via `markJobCompleted()`. If a `BotEscrow` agreement exists for the job, it must be in `RELEASED` state.
6. `CANCELLED` — Client cancels an `OPEN`/`IN_REVIEW` job, or cancels an `IN_PROGRESS` job only after `BotEscrow` settles the escrow as `REFUNDED` or `CANCELLED`.

### Application Lifecycle (`ApplicationStatus`)
- `PENDING` → Submitted via `applyForJob()`
- `SHORTLISTED` → Shortlisted by job client via `shortlistApplication()`
- `ACCEPTED` → Accepted by job client via `acceptApplication()`
- `REJECTED` → Rejected by job client or invalidated when a competing applicant is hired
- `WITHDRAWN` → Withdrawn by applicant via `withdrawApplication()` while `PENDING`

---

## 7. Security & Access Control

- **AccessControl**: `DEFAULT_ADMIN_ROLE` and `PAUSER_ROLE` can pause/unpause the marketplace and configure ecosystem contract addresses (`BotEscrow`, `BotRepute`, `BotNS`).
- **Admin Boundaries**: Admins **cannot** alter job ownership, modify applications, arbitrarily mark jobs completed, change freelancer profiles, or touch user funds.
- **Reentrancy & Checks-Effects-Interactions**: All state transitions validate caller permissions and state preconditions before mutating storage, protected by `ReentrancyGuard` and `Pausable`.

---

## 8. Installation, Testing & Deployment

### 1. Install Dependencies
```bash
# Root (Smart Contracts & Hardhat)
npm install

# Frontend (Next.js)
cd frontend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```env
PRIVATE_KEY=
BOTCHAIN_RPC_URL=https://rpc.botchain.ai
BOTJOBS_CONTRACT_ADDRESS=0x9b5210dC02E7C0f363B1094FA9107Fd6001C8688
BOTESCROW_CONTRACT_ADDRESS=
BOTREPUTE_CONTRACT_ADDRESS=
BOTNS_CONTRACT_ADDRESS=0x2ce45ff1847273f0fd11714744c4f238d004e026
```

Copy `frontend/.env.example` to `frontend/.env.local`:
```env
NEXT_PUBLIC_BOTCHAIN_CHAIN_ID=677
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_BOTCHAIN_EXPLORER_URL=https://scan.botchain.ai
NEXT_PUBLIC_BOTJOBS_ADDRESS=0x9b5210dC02E7C0f363B1094FA9107Fd6001C8688
NEXT_PUBLIC_BOT_ESCROW_ADDRESS=
NEXT_PUBLIC_BOT_REPUTE_ADDRESS=
NEXT_PUBLIC_BOT_NS_ADDRESS=0x2ce45ff1847273f0fd11714744c4f238d004e026
```

### 3. Compile & Test Smart Contracts
```bash
npm run compile
npm test
npm run typecheck
```

### 4. Deploy Smart Contracts
```bash
# Local Hardhat Network verification
npm run deploy:local

# Botchain Mainnet (Chain ID 677) - requires funded PRIVATE_KEY in .env
npm run deploy:mainnet
```

### 5. Run & Build Frontend
```bash
cd frontend
npm run lint
npm run typecheck
npm run build
npm run dev
```

---

## 9. Limitations & Future Roadmap

- **Indexing**: For MVP, the frontend reads contract state directly from Botchain RPC and filters client-side. High-volume production versions can integrate **The Graph** or **Covalent** subgraphs indexing `BotJobs` events.
- **Automated Credential Issuance**: Once `BotRepute` is deployed and connected, `JobCompleted` events can trigger `PROJECT_CONTRIBUTOR` and `BUILDER` credential minting.

---

## 10. Security Disclaimer

BotJobs is experimental Web3 marketplace software. Smart contracts may contain vulnerabilities. Users should verify contract addresses before interacting. BotJobs does not custody payment funds in the marketplace contract; payment custody is delegated to BotEscrow when integrated. On-chain profiles are public, and metadata URIs may expose information publicly.
