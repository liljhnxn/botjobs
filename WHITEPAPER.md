# BotJobs Technical Whitepaper

**A Non-Custodial, Decentralized Job & Talent Marketplace for the Botchain Ecosystem**  
*Version 1.0 — October 2026*  
*Network: Botchain Mainnet (Chain ID: 677)*  
*Repository: https://github.com/liljhnxn/botjobs*  

---

## Executive Summary

**BotJobs** is a decentralized, non-custodial talent and job marketplace built natively for the **Botchain Mainnet** (Chain ID `677`) ecosystem. Traditional freelance platforms (Upwork, Fiverr, Freelancer) impose prohibitive commission fees (10–20%), centralized censorship, opaque dispute handling, and isolated reputation silos. 

BotJobs resolves these structural deficiencies by establishing:
1. **Decentralized Job & Proposal Discovery**: Transparent on-chain job postings and cryptographic proposals with guaranteed immutability.
2. **Strict Non-Custodial Financial Architecture**: The core marketplace contract (`BotJobs.sol`) strictly handles discovery, proposal lifecycle, and hiring agreements without custodiating client funds—delegating escrow custody, milestone releases, and dispute resolution to **BotEscrow**.
3. **Sovereign On-Chain Reputation & Identity**: Native integration with **BotNS** (decentralized `.bot` domain name resolution) and **BotRepute** (verifiable, soulbound/attested credentials for developers and creators).
4. **Transparent State Machine**: Deterministic state transitions from job creation to acceptance, hire confirmation, and milestone completion.

---

## 1. Problem Statement

### 1.1 Centralized Rent Extraction
Traditional Web3 and Web2 freelance platforms charge 10% to 20% on all earnings, extracting significant value from developers, auditors, and technical contributors.

### 1.2 Fragmented & Non-Verifiable Reputation
Freelancer reputations are locked inside centralized corporate databases. If a platform suspends an account, years of verifiable client history, reviews, and ratings are wiped out. Web3 builders lack a sovereign, tamper-proof work identity.

### 1.3 Custodial Vulnerabilities & Dispute Bias
Centralized escrow intermediaries hold private keys and custody over user funds, introducing counterparty risk, arbitrary account freezes, and opaque dispute arbitration that disproportionately favors centralized platform revenue over fairness.

### 1.4 Sybil Attacks & Unbounded State Bloat
Unrestricted on-chain marketplaces frequently suffer from state bloat, malicious spam proposals, and frontrunning. A production Web3 marketplace requires strict byte constraints and state machine guarantees.

---

## 2. The BotJobs Architecture

BotJobs is designed around separation of concerns, decoupling the **marketplace discovery and hiring layer** from the **financial custody and settlement layer**.

```
+-------------------------------------------------------------+
|                      User Interface                         |
|         (Next.js 14, Tailwind CSS, wagmi v2, viem)          |
+-------------------------------------------------------------+
                              |
       +----------------------+----------------------+
       |                                             |
       v                                             v
+-----------------------------+       +-----------------------------+
|         BotNS.sol           |       |        BotRepute.sol        |
|  .bot Domain Resolution     |       | Verified Talent Credentials |
+-----------------------------+       +-----------------------------+
               \                                     /
                \                                   /
                 v                                 v
        +--------------------------------------------------+
        |                  BotJobs.sol                     |
        |  - Job Postings & Applications                   |
        |  - Proposal Reviews & Shortlisting               |
        |  - Sovereign Freelancer Profiles                 |
        |  - Non-Custodial Hiring Coordination             |
        +--------------------------------------------------+
                                  |
                                  v
        +--------------------------------------------------+
        |                 BotEscrow.sol                    |
        |  - Milestone Payment Custody (BOT Token)         |
        |  - Release / Refund State Transitions            |
        |  - Arbitration / Dispute Resolution              |
        +--------------------------------------------------+
```

### 2.1 Non-Custodial Boundary
`BotJobs.sol` explicitly forbids holding native BOT or ERC20 funds:
- Native payment fallback and receive methods revert immediately with `PaymentCustodyNotAllowed()`.
- Escrow deposits, milestone payments, releases, and refund arbitration are strictly encapsulated in `BotEscrow.sol`.

### 2.2 Modular Ecosystem Integrations
- **BotNS**: Resolves human-readable addresses (e.g. `alice.bot`) directly within applicant profiles and job listings.
- **BotRepute**: Queries on-chain credential tokens (`DEVELOPER`, `BUILDER`, `CONTRIBUTOR`, `CREATOR`) to highlight proven talent with verified on-chain track records.
- **BotEscrow**: Connects hired agreements directly to verifiable escrow locks on Botchain.

---

## 3. Smart Contract Specifications

### 3.1 Job Lifecycle State Machine

A job progresses through the following deterministic states:
1. **`OPEN`**: Client posts job with title, deliverables, category, budget, and application deadline (`createJob`).
2. **`IN_REVIEW`**: Client shortlists candidate proposals (`shortlistApplication`).
3. **`HIRED`**: Client accepts the winning candidate (`acceptApplication`). Competing pending/shortlisted proposals are automatically marked `REJECTED`.
4. **`IN_PROGRESS`**: Selected freelancer calls `confirmHire()`. If the freelancer fails to confirm within `hireConfirmationTimeout` (default 3 days), the client can cancel via `cancelUnconfirmedHire()`.
5. **`COMPLETED`**: Client confirms project delivery (`markJobCompleted()`). If an associated BotEscrow agreement is bound, the escrow must be in `RELEASED` status.
6. **`CANCELLED`**: Client cancels an unfilled job, or an in-progress job after BotEscrow has issued a refund.

### 3.2 Proposal Lifecycle (`ApplicationStatus`)
- `PENDING` $\rightarrow$ Initial proposal submitted with proposed budget, delivery timeframe, and technical roadmap.
- `SHORTLISTED` $\rightarrow$ Flagged by client for final consideration.
- `ACCEPTED` $\rightarrow$ Awarded to the applicant.
- `REJECTED` $\rightarrow$ Denied by client or automatically invalidated when another candidate is hired.
- `WITHDRAWN` $\rightarrow$ Retracted by the applicant prior to client decision.

### 3.3 Storage Optimization & DoS Defenses
To prevent gas exhaustion, network spam, and state bloat, `BotJobs.sol` enforces hard byte bounds on all text fields:
- `MAX_TITLE_LENGTH`: 120 bytes
- `MAX_DESCRIPTION_LENGTH`: 4,000 bytes
- `MAX_PROPOSAL_LENGTH`: 3,000 bytes
- `MAX_BIO_LENGTH`: 1,000 bytes
- `MAX_HEADLINE_LENGTH`: 150 bytes
- `MAX_DISPLAY_NAME_LENGTH`: 80 bytes
- `MAX_SKILL_COUNT`: 25 skills per talent profile
- `MAX_SKILL_LENGTH`: 50 bytes per skill
- `MAX_URI_LENGTH`: 512 bytes

---

## 4. Security & Access Control

- **OpenZeppelin v5 Primitives**: Uses audited standards including `AccessControl`, `Pausable`, and `ReentrancyGuard`.
- **Admin Constraints**: Administrators have zero authority to modify job metadata, alter agreements, seize funds, or reassign applications. Admin controls are strictly limited to emergency circuit-breaking (`pause` / `unpause`) and setting ecosystem integration contract addresses.
- **Checks-Effects-Interactions**: All state mutations are performed before external calls or event emissions.

---

## 5. Deployed Network & Contract Addresses

All contracts are deployed and operational on the **Botchain Mainnet**:

| Parameter | Network Details |
| :--- | :--- |
| **Network Name** | Botchain Mainnet |
| **Chain ID** | `677` |
| **RPC Endpoint** | `https://rpc.botchain.ai` |
| **Block Explorer** | `https://scan.botchain.ai` |
| **Native Currency** | `BOT` |

### Core Protocol Contracts
- **BotJobs Contract**: [`0x9b5210dC02E7C0f363B1094FA9107Fd6001C8688`](https://scan.botchain.ai/address/0x9b5210dC02E7C0f363B1094FA9107Fd6001C8688)
- **BotNS Contract**: [`0x2ce45ff1847273f0fd11714744c4f238d004e026`](https://scan.botchain.ai/address/0x2ce45ff1847273f0fd11714744c4f238d004e026)
- **BotEscrow Contract**: Configurable via admin `setEcosystemContracts()`
- **BotRepute Contract**: Configurable via admin `setEcosystemContracts()`

---

## 6. Roadmap & Future Evolution

- **Q4 2026 — Subgraph & Event Indexing**: Deploy decentralized subgraphs (The Graph / Covalent) to support instant client-side full-text search, filtering, and analytics across thousands of jobs.
- **Q1 2027 — Automated Credential Minting**: Link BotRepute directly to BotJobs contract events to automatically issue on-chain non-transferable reputation badges upon verified job completion.
- **Q2 2027 — BotDAO Decentralized Dispute Arbitration**: Community-staked juror courts for fair, decentralized escrow dispute resolution.
- **Q3 2027 — Mainnet Launch & Cross-Chain Expansion**: Deploy on Botchain Mainnet with optional cross-chain bridge settlement.

---

## 7. Contact & Official Resources

- **GitHub Repository**: [https://github.com/liljhnxn/botjobs](https://github.com/liljhnxn/botjobs)
- **Whitepaper Source**: [https://github.com/liljhnxn/botjobs/blob/main/WHITEPAPER.md](https://github.com/liljhnxn/botjobs/blob/main/WHITEPAPER.md)
- **Pitch Deck Source**: [https://github.com/liljhnxn/botjobs/blob/main/PITCH_DECK.md](https://github.com/liljhnxn/botjobs/blob/main/PITCH_DECK.md)
