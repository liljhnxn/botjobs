import { isAddress, stringToHex, hexToString, Address } from "viem";
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_RPC_URL,
  BOTCHAIN_EXPLORER_URL,
} from "../config/network";

export const DEFAULT_BOTJOBS_MAINNET_ADDRESS: Address =
  "0x9b5210dC02E7C0f363B1094FA9107Fd6001C8688";
export const DEFAULT_BOTNS_MAINNET_ADDRESS: Address =
  "0x2ce45ff1847273f0fd11714744c4f238d004e026";

function parseConfiguredAddress(
  envValue?: string,
  fallback?: Address
): Address | undefined {
  if (!envValue) return fallback;
  const trimmed = envValue.trim();
  if (!trimmed || trimmed === "0x0000000000000000000000000000000000000000") {
    return fallback;
  }
  return isAddress(trimmed) ? (trimmed as Address) : fallback;
}

export const CONTRACT_CONFIG = {
  chainId: BOTCHAIN_CHAIN_ID,
  rpcUrl: BOTCHAIN_RPC_URL,
  explorerUrl: BOTCHAIN_EXPLORER_URL,
  botJobsAddress: parseConfiguredAddress(
    process.env.NEXT_PUBLIC_BOTJOBS_ADDRESS,
    DEFAULT_BOTJOBS_MAINNET_ADDRESS
  ),
  botEscrowAddress: parseConfiguredAddress(
    process.env.NEXT_PUBLIC_BOT_ESCROW_ADDRESS
  ),
  botReputeAddress: parseConfiguredAddress(
    process.env.NEXT_PUBLIC_BOT_REPUTE_ADDRESS
  ),
  botNSAddress: parseConfiguredAddress(
    process.env.NEXT_PUBLIC_BOT_NS_ADDRESS,
    DEFAULT_BOTNS_MAINNET_ADDRESS
  ),
} as const;

export const JOB_CATEGORIES = [
  "Smart Contracts",
  "Frontend",
  "Backend",
  "Full-Stack Web3",
  "UI/UX Design",
  "Security & Audits",
  "Data & Indexing",
  "DevOps & Infrastructure",
  "Mobile Development",
  "Technical Writing",
] as const;

export const RECOMMENDED_SKILLS = [
  "Solidity",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "UI/UX",
  "Frontend",
  "Backend",
  "Smart Contracts",
  "Web3",
  "Data Analysis",
  "Graphic Design",
  "Mobile Development",
  "DevOps",
] as const;

export function encodeCategoryBytes32(category: string): `0x${string}` {
  return stringToHex(category.slice(0, 31), { size: 32 });
}

export function decodeCategoryBytes32(bytes32Hex: `0x${string}`): string {
  try {
    const decoded = hexToString(bytes32Hex, { size: 32 }).replace(/\0/g, "").trim();
    return decoded || "Uncategorized";
  } catch {
    return "Uncategorized";
  }
}

export const JOB_STATUS_LABELS: Record<number, string> = {
  0: "OPEN",
  1: "IN_REVIEW",
  2: "HIRED",
  3: "IN_PROGRESS",
  4: "COMPLETED",
  5: "CANCELLED",
};

export const APPLICATION_STATUS_LABELS: Record<number, string> = {
  0: "PENDING",
  1: "SHORTLISTED",
  2: "ACCEPTED",
  3: "REJECTED",
  4: "WITHDRAWN",
};

export const BOTJOBS_ABI = [
  {
    type: "function",
    name: "PAUSER_ROLE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "DEFAULT_ADMIN_ROLE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "hasRole",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "pause",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "unpause",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "botEscrowAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "botReputeAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "botNSAddress",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "hireConfirmationTimeout",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "setEcosystemContracts",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_botEscrow", type: "address" },
      { name: "_botRepute", type: "address" },
      { name: "_botNS", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "createJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "category", type: "bytes32" },
      { name: "budget", type: "uint256" },
      { name: "applicationDeadline", type: "uint256" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "applyForJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "proposal", type: "string" },
      { name: "proposedBudget", type: "uint256" },
      { name: "estimatedDays", type: "uint256" },
      { name: "portfolioURI", type: "string" },
    ],
    outputs: [{ name: "applicationId", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdrawApplication",
    stateMutability: "nonpayable",
    inputs: [{ name: "applicationId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "shortlistApplication",
    stateMutability: "nonpayable",
    inputs: [{ name: "applicationId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "rejectApplication",
    stateMutability: "nonpayable",
    inputs: [{ name: "applicationId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "acceptApplication",
    stateMutability: "nonpayable",
    inputs: [{ name: "applicationId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "confirmHire",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelUnconfirmedHire",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reopenJob", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "markJobCompleted",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "createProfile",
    stateMutability: "nonpayable",
    inputs: [
      { name: "displayName", type: "string" },
      { name: "headline", type: "string" },
      { name: "bio", type: "string" },
      { name: "skills", type: "string[]" },
      { name: "portfolioURI", type: "string" },
      { name: "hourlyRate", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateProfile",
    stateMutability: "nonpayable",
    inputs: [
      { name: "displayName", type: "string" },
      { name: "headline", type: "string" },
      { name: "bio", type: "string" },
      { name: "skills", type: "string[]" },
      { name: "portfolioURI", type: "string" },
      { name: "hourlyRate", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "deactivateProfile",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "category", type: "bytes32" },
          { name: "budget", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "applicationDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "selectedFreelancer", type: "address" },
          { name: "applicationCount", type: "uint256" },
          { name: "hiredAt", type: "uint256" },
          { name: "completedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getJobCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getApplication",
    stateMutability: "view",
    inputs: [{ name: "applicationId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "applicationId", type: "uint256" },
          { name: "jobId", type: "uint256" },
          { name: "freelancer", type: "address" },
          { name: "proposal", type: "string" },
          { name: "proposedBudget", type: "uint256" },
          { name: "estimatedDays", type: "uint256" },
          { name: "portfolioURI", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getAllJobs",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "category", type: "bytes32" },
          { name: "budget", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "applicationDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "selectedFreelancer", type: "address" },
          { name: "applicationCount", type: "uint256" },
          { name: "hiredAt", type: "uint256" },
          { name: "completedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getOpenJobs",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "category", type: "bytes32" },
          { name: "budget", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "applicationDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "selectedFreelancer", type: "address" },
          { name: "applicationCount", type: "uint256" },
          { name: "hiredAt", type: "uint256" },
          { name: "completedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getClientJobs",
    stateMutability: "view",
    inputs: [{ name: "client", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "category", type: "bytes32" },
          { name: "budget", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "applicationDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "selectedFreelancer", type: "address" },
          { name: "applicationCount", type: "uint256" },
          { name: "hiredAt", type: "uint256" },
          { name: "completedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getFreelancerJobs",
    stateMutability: "view",
    inputs: [{ name: "freelancer", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "category", type: "bytes32" },
          { name: "budget", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "applicationDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "selectedFreelancer", type: "address" },
          { name: "applicationCount", type: "uint256" },
          { name: "hiredAt", type: "uint256" },
          { name: "completedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getJobsByCategory",
    stateMutability: "view",
    inputs: [{ name: "category", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "client", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "metadataURI", type: "string" },
          { name: "category", type: "bytes32" },
          { name: "budget", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "applicationDeadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "selectedFreelancer", type: "address" },
          { name: "applicationCount", type: "uint256" },
          { name: "hiredAt", type: "uint256" },
          { name: "completedAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getJobApplications",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "applicationId", type: "uint256" },
          { name: "jobId", type: "uint256" },
          { name: "freelancer", type: "address" },
          { name: "proposal", type: "string" },
          { name: "proposedBudget", type: "uint256" },
          { name: "estimatedDays", type: "uint256" },
          { name: "portfolioURI", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getFreelancerApplications",
    stateMutability: "view",
    inputs: [{ name: "freelancer", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "applicationId", type: "uint256" },
          { name: "jobId", type: "uint256" },
          { name: "freelancer", type: "address" },
          { name: "proposal", type: "string" },
          { name: "proposedBudget", type: "uint256" },
          { name: "estimatedDays", type: "uint256" },
          { name: "portfolioURI", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "hasFreelancerApplied",
    stateMutability: "view",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "freelancer", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getProfile",
    stateMutability: "view",
    inputs: [{ name: "freelancer", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "freelancer", type: "address" },
          { name: "displayName", type: "string" },
          { name: "headline", type: "string" },
          { name: "bio", type: "string" },
          { name: "skills", type: "string[]" },
          { name: "portfolioURI", type: "string" },
          { name: "hourlyRate", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "updatedAt", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "hasProfile",
    stateMutability: "view",
    inputs: [{ name: "freelancer", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getCompletedJobsForFreelancer",
    stateMutability: "view",
    inputs: [{ name: "freelancer", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "client", type: "address" },
          { name: "freelancer", type: "address" },
          { name: "budget", type: "uint256" },
          { name: "completedAt", type: "uint256" },
          { name: "category", type: "bytes32" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getCompletedJobsForClient",
    stateMutability: "view",
    inputs: [{ name: "client", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "jobId", type: "uint256" },
          { name: "title", type: "string" },
          { name: "client", type: "address" },
          { name: "freelancer", type: "address" },
          { name: "budget", type: "uint256" },
          { name: "completedAt", type: "uint256" },
          { name: "category", type: "bytes32" },
        ],
      },
    ],
  },
] as const;

export const BOTNS_ABI = [
  {
    type: "function",
    name: "primaryName",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "name", type: "string" }],
  },
  {
    type: "function",
    name: "resolve",
    stateMutability: "view",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ name: "owner", type: "address" }],
  },
] as const;

export const BOTREPUTE_ABI = [
  {
    type: "function",
    name: "hasVerifiedCredential",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "roleType", type: "string" },
    ],
    outputs: [{ name: "hasRole", type: "bool" }],
  },
  {
    type: "function",
    name: "getCredentials",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      {
        name: "credentials",
        type: "tuple[]",
        components: [
          { name: "credentialId", type: "bytes32" },
          { name: "roleType", type: "string" },
          { name: "issuer", type: "address" },
          { name: "issuedAt", type: "uint64" },
          { name: "metadataURI", type: "string" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
] as const;

export const BOTESCROW_ABI = [
  {
    type: "function",
    name: "hasEscrowForJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [{ name: "exists", type: "bool" }],
  },
  {
    type: "function",
    name: "getJobEscrowStatus",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [{ name: "status", type: "uint8" }],
  },
  {
    type: "function",
    name: "getJobEscrowDetails",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      { name: "client", type: "address" },
      { name: "freelancer", type: "address" },
      { name: "lockedAmount", type: "uint256" },
      { name: "releasedAmount", type: "uint256" },
    ],
  },
] as const;
