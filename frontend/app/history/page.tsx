"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { History, Loader2 } from "lucide-react";
import {
  useCompletedJobsForFreelancer,
  useCompletedJobsForClient,
  OnChainWorkHistory,
} from "../../lib/useBotJobs";
import { decodeCategoryBytes32 } from "../../lib/contracts";
import { formatBotAmount, formatDateTime } from "../../lib/format";
import { AddressDisplay } from "../../components/AddressDisplay";
import { ContractNotConfiguredBanner } from "../../components/ContractNotConfiguredBanner";

export default function CompletedWorkHistoryPage() {
  const { address, isConnected } = useAccount();
  const { data: rawFreelancerHistory, isLoading: fLoading } =
    useCompletedJobsForFreelancer(address);
  const { data: rawClientHistory, isLoading: cLoading } =
    useCompletedJobsForClient(address);

  const freelancerHistory =
    (rawFreelancerHistory as OnChainWorkHistory[] | undefined) || [];
  const clientHistory =
    (rawClientHistory as OnChainWorkHistory[] | undefined) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          On-Chain Completed Work History
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Immutable work records derived directly from completed BotJobs agreements.
        </p>
      </div>

      <ContractNotConfiguredBanner />

      {!isConnected ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-2">
          <History className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-white">
            Connect your wallet to inspect your on-chain work history.
          </p>
        </div>
      ) : fLoading || cLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      ) : freelancerHistory.length === 0 && clientHistory.length === 0 ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-2">
          <History className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">
            No completed work yet.
          </p>
          <p className="text-xs text-slate-400">
            Completed jobs for your connected wallet will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Completed as Freelancer ({freelancerHistory.length})
            </h2>
            {freelancerHistory.length === 0 ? (
              <p className="text-xs text-slate-400">No completed work yet.</p>
            ) : (
              <div className="space-y-3">
                {freelancerHistory.map((item) => (
                  <div
                    key={item.jobId.toString()}
                    className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#11151F] border border-[#232B3E] text-slate-300">
                        {decodeCategoryBytes32(item.category)}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatBotAmount(item.budget)} BOT
                      </span>
                    </div>
                    <Link
                      href={`/jobs/${item.jobId.toString()}`}
                      className="block text-sm font-semibold text-white hover:text-emerald-400"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span>Client:</span>
                        <AddressDisplay address={item.client} showCopy={false} />
                      </div>
                      <span>{formatDateTime(item.completedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Completed as Client ({clientHistory.length})
            </h2>
            {clientHistory.length === 0 ? (
              <p className="text-xs text-slate-400">No completed work yet.</p>
            ) : (
              <div className="space-y-3">
                {clientHistory.map((item) => (
                  <div
                    key={item.jobId.toString()}
                    className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded bg-[#11151F] border border-[#232B3E] text-slate-300">
                        {decodeCategoryBytes32(item.category)}
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatBotAmount(item.budget)} BOT
                      </span>
                    </div>
                    <Link
                      href={`/jobs/${item.jobId.toString()}`}
                      className="block text-sm font-semibold text-white hover:text-emerald-400"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span>Freelancer:</span>
                        <AddressDisplay
                          address={item.freelancer}
                          showCopy={false}
                        />
                      </div>
                      <span>{formatDateTime(item.completedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
