"use client";

import { useState, useCallback } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useSwitchChain,
} from "wagmi";
import { Address } from "viem";
import {
  CONTRACT_CONFIG,
  BOTJOBS_ABI,
  BOTNS_ABI,
  BOTREPUTE_ABI,
  BOTESCROW_ABI,
} from "./contracts";
import { BOTCHAIN_CHAIN_ID } from "../config/network";
import { parseContractError } from "./format";

export type TxLifecycleState =
  | "idle"
  | "wallet_confirmation"
  | "submitted"
  | "confirming"
  | "success"
  | "error";

export interface OnChainJob {
  jobId: bigint;
  client: Address;
  title: string;
  description: string;
  metadataURI: string;
  category: `0x${string}`;
  budget: bigint;
  createdAt: bigint;
  applicationDeadline: bigint;
  status: number;
  selectedFreelancer: Address;
  applicationCount: bigint;
  hiredAt: bigint;
  completedAt: bigint;
}

export interface OnChainApplication {
  applicationId: bigint;
  jobId: bigint;
  freelancer: Address;
  proposal: string;
  proposedBudget: bigint;
  estimatedDays: bigint;
  portfolioURI: string;
  createdAt: bigint;
  status: number;
}

export interface OnChainProfile {
  freelancer: Address;
  displayName: string;
  headline: string;
  bio: string;
  skills: readonly string[];
  portfolioURI: string;
  hourlyRate: bigint;
  createdAt: bigint;
  updatedAt: bigint;
  active: boolean;
}

export interface OnChainWorkHistory {
  jobId: bigint;
  title: string;
  client: Address;
  freelancer: Address;
  budget: bigint;
  completedAt: bigint;
  category: `0x${string}`;
}

export function useBotJobsAddress(): Address | undefined {
  return CONTRACT_CONFIG.botJobsAddress;
}

export function useAllJobs() {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getAllJobs",
    query: {
      enabled: Boolean(address),
    },
  });
}

export function useOpenJobs() {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getOpenJobs",
    query: {
      enabled: Boolean(address),
    },
  });
}

export function useJob(jobId?: bigint) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getJob",
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: Boolean(address && jobId !== undefined && jobId > 0n),
    },
  });
}

export function useJobApplications(jobId?: bigint) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getJobApplications",
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: Boolean(address && jobId !== undefined && jobId > 0n),
    },
  });
}

export function useApplication(applicationId?: bigint) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getApplication",
    args: applicationId !== undefined ? [applicationId] : undefined,
    query: {
      enabled: Boolean(address && applicationId !== undefined && applicationId > 0n),
    },
  });
}

export function useClientJobs(client?: Address) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getClientJobs",
    args: client ? [client] : undefined,
    query: {
      enabled: Boolean(address && client),
    },
  });
}

export function useFreelancerJobs(freelancer?: Address) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getFreelancerJobs",
    args: freelancer ? [freelancer] : undefined,
    query: {
      enabled: Boolean(address && freelancer),
    },
  });
}

export function useFreelancerApplications(freelancer?: Address) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getFreelancerApplications",
    args: freelancer ? [freelancer] : undefined,
    query: {
      enabled: Boolean(address && freelancer),
    },
  });
}

export function useHasFreelancerApplied(jobId?: bigint, freelancer?: Address) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "hasFreelancerApplied",
    args: jobId !== undefined && freelancer ? [jobId, freelancer] : undefined,
    query: {
      enabled: Boolean(address && jobId !== undefined && jobId > 0n && freelancer),
    },
  });
}

export function useFreelancerProfile(freelancer?: Address) {
  const address = useBotJobsAddress();
  const hasProfileQuery = useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "hasProfile",
    args: freelancer ? [freelancer] : undefined,
    query: {
      enabled: Boolean(address && freelancer),
    },
  });

  const profileQuery = useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getProfile",
    args: freelancer ? [freelancer] : undefined,
    query: {
      enabled: Boolean(address && freelancer && hasProfileQuery.data === true),
    },
  });

  return {
    exists: Boolean(hasProfileQuery.data),
    profile: profileQuery.data as OnChainProfile | undefined,
    isLoading: hasProfileQuery.isLoading || profileQuery.isLoading,
    error: hasProfileQuery.error || profileQuery.error,
    refetch: async () => {
      await hasProfileQuery.refetch();
      await profileQuery.refetch();
    },
  };
}

export function useCompletedJobsForFreelancer(freelancer?: Address) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getCompletedJobsForFreelancer",
    args: freelancer ? [freelancer] : undefined,
    query: {
      enabled: Boolean(address && freelancer),
    },
  });
}

export function useCompletedJobsForClient(client?: Address) {
  const address = useBotJobsAddress();
  return useReadContract({
    address,
    abi: BOTJOBS_ABI,
    functionName: "getCompletedJobsForClient",
    args: client ? [client] : undefined,
    query: {
      enabled: Boolean(address && client),
    },
  });
}

export function useBotNSResolution(account?: Address) {
  const botNSAddress = CONTRACT_CONFIG.botNSAddress;
  const query = useReadContract({
    address: botNSAddress,
    abi: BOTNS_ABI,
    functionName: "primaryName",
    args: account ? [account] : undefined,
    query: {
      enabled: Boolean(botNSAddress && account),
    },
  });

  return {
    isConfigured: Boolean(botNSAddress),
    botName: query.data && query.data.length > 0 ? query.data : undefined,
    isLoading: query.isLoading,
  };
}

export function useBotReputeCredentials(account?: Address) {
  const botReputeAddress = CONTRACT_CONFIG.botReputeAddress;
  const query = useReadContract({
    address: botReputeAddress,
    abi: BOTREPUTE_ABI,
    functionName: "getCredentials",
    args: account ? [account] : undefined,
    query: {
      enabled: Boolean(botReputeAddress && account),
    },
  });

  return {
    isConfigured: Boolean(botReputeAddress),
    credentials: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useJobEscrowInfo(jobId?: bigint) {
  const botEscrowAddress = CONTRACT_CONFIG.botEscrowAddress;

  const hasEscrowQuery = useReadContract({
    address: botEscrowAddress,
    abi: BOTESCROW_ABI,
    functionName: "hasEscrowForJob",
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: Boolean(botEscrowAddress && jobId !== undefined && jobId > 0n),
    },
  });

  const statusQuery = useReadContract({
    address: botEscrowAddress,
    abi: BOTESCROW_ABI,
    functionName: "getJobEscrowStatus",
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: Boolean(
        botEscrowAddress &&
          jobId !== undefined &&
          jobId > 0n &&
          hasEscrowQuery.data === true
      ),
    },
  });

  const detailsQuery = useReadContract({
    address: botEscrowAddress,
    abi: BOTESCROW_ABI,
    functionName: "getJobEscrowDetails",
    args: jobId !== undefined ? [jobId] : undefined,
    query: {
      enabled: Boolean(
        botEscrowAddress &&
          jobId !== undefined &&
          jobId > 0n &&
          hasEscrowQuery.data === true
      ),
    },
  });

  return {
    isConfigured: Boolean(botEscrowAddress),
    hasEscrow: Boolean(hasEscrowQuery.data),
    status: statusQuery.data,
    details: detailsQuery.data,
    isLoading:
      hasEscrowQuery.isLoading || statusQuery.isLoading || detailsQuery.isLoading,
  };
}

/**
 * Reusable transaction execution hook enforcing Botchain network validation and full receipt confirmation.
 * Never reports success before on-chain confirmation.
 */
export function useBotJobsWrite() {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [txState, setTxState] = useState<TxLifecycleState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const receiptQuery = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: BOTCHAIN_CHAIN_ID,
    query: {
      enabled: Boolean(txHash),
    },
  });

  const DerivedState: TxLifecycleState = (() => {
    if (txState === "error") return "error";
    if (txState === "wallet_confirmation") return "wallet_confirmation";
    if (txHash) {
      if (receiptQuery.isSuccess) return "success";
      if (receiptQuery.isError) return "error";
      return "confirming";
    }
    return txState;
  })();

  const executeWrite = useCallback(
    async (
      functionName: string,
      args: readonly unknown[]
    ): Promise<`0x${string}` | undefined> => {
      setErrorMessage(null);
      setTxHash(undefined);

      if (!CONTRACT_CONFIG.botJobsAddress) {
        setTxState("error");
        setErrorMessage(
          "BotJobs contract address is not configured. Set NEXT_PUBLIC_BOTJOBS_ADDRESS in environment."
        );
        return undefined;
      }

      if (!isConnected) {
        setTxState("error");
        setErrorMessage("Please connect your Web3 wallet first.");
        return undefined;
      }

      try {
        if (chainId !== BOTCHAIN_CHAIN_ID) {
          setTxState("wallet_confirmation");
          await switchChainAsync({ chainId: BOTCHAIN_CHAIN_ID });
        }

        setTxState("wallet_confirmation");
        const hash = await writeContractAsync({
          address: CONTRACT_CONFIG.botJobsAddress,
          abi: BOTJOBS_ABI,
          functionName: functionName as never,
          args: args as never,
          chainId: BOTCHAIN_CHAIN_ID,
        });

        setTxHash(hash);
        setTxState("submitted");
        return hash;
      } catch (err) {
        setTxState("error");
        setErrorMessage(parseContractError(err));
        return undefined;
      }
    },
    [isConnected, chainId, switchChainAsync, writeContractAsync]
  );

  const resetTx = useCallback(() => {
    setTxHash(undefined);
    setTxState("idle");
    setErrorMessage(null);
  }, []);

  return {
    executeWrite,
    resetTx,
    txHash,
    txState: DerivedState,
    receipt: receiptQuery.data,
    errorMessage:
      errorMessage ||
      (receiptQuery.error ? parseContractError(receiptQuery.error) : null),
  };
}
