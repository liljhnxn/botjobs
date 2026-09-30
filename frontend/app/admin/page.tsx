"use client";

import React, { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { isAddress } from "viem";
import { ShieldCheck, PauseCircle, PlayCircle, Save } from "lucide-react";
import { CONTRACT_CONFIG, BOTJOBS_ABI } from "../../lib/contracts";
import { useBotJobsWrite } from "../../lib/useBotJobs";
import { AddressDisplay } from "../../components/AddressDisplay";
import { TransactionStatusBanner } from "../../components/TransactionStatusBanner";
import { ContractNotConfiguredBanner } from "../../components/ContractNotConfiguredBanner";

export default function AdminConfigurationPage() {
  const { address, isConnected } = useAccount();
  const botJobsAddr = CONTRACT_CONFIG.botJobsAddress;

  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    address: botJobsAddr,
    abi: BOTJOBS_ABI,
    functionName: "paused",
    query: { enabled: Boolean(botJobsAddr) },
  });

  const { data: onChainEscrow } = useReadContract({
    address: botJobsAddr,
    abi: BOTJOBS_ABI,
    functionName: "botEscrowAddress",
    query: { enabled: Boolean(botJobsAddr) },
  });

  const { data: onChainRepute } = useReadContract({
    address: botJobsAddr,
    abi: BOTJOBS_ABI,
    functionName: "botReputeAddress",
    query: { enabled: Boolean(botJobsAddr) },
  });

  const { data: onChainNS } = useReadContract({
    address: botJobsAddr,
    abi: BOTJOBS_ABI,
    functionName: "botNSAddress",
    query: { enabled: Boolean(botJobsAddr) },
  });

  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  const [escrowInput, setEscrowInput] = useState("");
  const [reputeInput, setReputeInput] = useState("");
  const [nsInput, setNsInput] = useState("");

  const handleUpdateIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    const zero = "0x0000000000000000000000000000000000000000";
    const esc = isAddress(escrowInput.trim()) ? escrowInput.trim() : zero;
    const rep = isAddress(reputeInput.trim()) ? reputeInput.trim() : zero;
    const ns = isAddress(nsInput.trim()) ? nsInput.trim() : zero;

    await executeWrite("setEcosystemContracts", [esc, rep, ns]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          Contract Administration & Ecosystem Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect environment configuration and manage emergency pause or ecosystem addresses (requires DEFAULT_ADMIN_ROLE / PAUSER_ROLE).
        </p>
      </div>

      <ContractNotConfiguredBanner />

      <TransactionStatusBanner
        state={txState}
        txHash={txHash}
        errorMessage={errorMessage}
        onReset={() => {
          resetTx();
          refetchPaused();
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            Environment & On-Chain State
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Connected Wallet</span>
              {isConnected && address ? (
                <AddressDisplay address={address} />
              ) : (
                <span className="text-amber-400">Not connected</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">BotJobs Contract</span>
              {botJobsAddr ? (
                <AddressDisplay address={botJobsAddr} />
              ) : (
                <span className="text-amber-400 font-mono">Not configured</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Marketplace Paused</span>
              <span className="font-mono text-white">
                {botJobsAddr ? (isPaused ? "PAUSED" : "ACTIVE") : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">On-Chain BotEscrow</span>
              <AddressDisplay address={onChainEscrow as string | undefined} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">On-Chain BotRepute</span>
              <AddressDisplay address={onChainRepute as string | undefined} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">On-Chain BotNS</span>
              <AddressDisplay address={onChainNS as string | undefined} />
            </div>
          </div>

          {botJobsAddr && (
            <div className="pt-4 border-t border-[#232B3E] flex items-center gap-3">
              <button
                type="button"
                onClick={() => executeWrite("pause", [])}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-medium text-amber-300 hover:bg-amber-500/25"
              >
                <PauseCircle className="w-4 h-4" /> Pause Marketplace
              </button>
              <button
                type="button"
                onClick={() => executeWrite("unpause", [])}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25"
              >
                <PlayCircle className="w-4 h-4" /> Unpause Marketplace
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            Update Ecosystem Integration Addresses
          </h2>
          <p className="text-xs text-slate-400">
            Admin cannot alter job ownership, applications, or user funds. Admin can only pause/unpause or link deployed BotEscrow, BotRepute, and BotNS addresses.
          </p>

          <form onSubmit={handleUpdateIntegrations} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                BotEscrow Address
              </label>
              <input
                type="text"
                value={escrowInput}
                onChange={(e) => setEscrowInput(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                BotRepute Address
              </label>
              <input
                type="text"
                value={reputeInput}
                onChange={(e) => setReputeInput(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                BotNS Address
              </label>
              <input
                type="text"
                value={nsInput}
                onChange={(e) => setNsInput(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs font-mono text-white"
              />
            </div>
            <button
              type="submit"
              disabled={!botJobsAddr}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> Update Ecosystem Contracts
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
