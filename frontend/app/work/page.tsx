"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ShieldCheck, CheckCircle2, ArrowUpRight, Loader2 } from "lucide-react";
import {
  useClientJobs,
  useFreelancerJobs,
  useBotJobsWrite,
  OnChainJob,
} from "../../lib/useBotJobs";
import { CONTRACT_CONFIG, decodeCategoryBytes32 } from "../../lib/contracts";
import { formatBotAmount } from "../../lib/format";
import { JobStatusBadge } from "../../components/StatusBadge";
import { AddressDisplay } from "../../components/AddressDisplay";
import { TransactionStatusBanner } from "../../components/TransactionStatusBanner";
import { ContractNotConfiguredBanner } from "../../components/ContractNotConfiguredBanner";

export default function ActiveWorkPage() {
  const { address, isConnected } = useAccount();
  const {
    data: rawClientJobs,
    isLoading: clientLoading,
    refetch: refetchClient,
  } = useClientJobs(address);
  const {
    data: rawFreelancerJobs,
    isLoading: freelancerLoading,
    refetch: refetchFreelancer,
  } = useFreelancerJobs(address);

  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  useEffect(() => {
    if (txState === "success") {
      refetchClient();
      refetchFreelancer();
    }
  }, [txState, refetchClient, refetchFreelancer]);

  const activeClientJobs = (
    (rawClientJobs as OnChainJob[] | undefined) || []
  ).filter((j) => j.status === 2 || j.status === 3); // HIRED or IN_PROGRESS

  const activeFreelancerJobs = (
    (rawFreelancerJobs as OnChainJob[] | undefined) || []
  ).filter((j) => j.status === 2 || j.status === 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          My Active Work Agreements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage hired and in-progress agreements as either a client or a selected freelancer.
        </p>
      </div>

      <ContractNotConfiguredBanner />

      <TransactionStatusBanner
        state={txState}
        txHash={txHash}
        errorMessage={errorMessage}
        onReset={resetTx}
      />

      {!CONTRACT_CONFIG.botEscrowAddress && (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Escrow Custody Status:{" "}
              <strong className="font-mono text-amber-400">
                BotEscrow contract not configured.
              </strong>
            </span>
          </div>
          <Link href="/developer" className="text-emerald-400 hover:underline">
            Integration Docs →
          </Link>
        </div>
      )}

      {!isConnected ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center">
          <p className="text-sm text-white font-medium">
            Connect your wallet to view active work agreements.
          </p>
        </div>
      ) : clientLoading || freelancerLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AS FREELANCER */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Active Work as Freelancer ({activeFreelancerJobs.length})
            </h2>
            {activeFreelancerJobs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">
                No active work assignments as a freelancer.
              </p>
            ) : (
              <div className="space-y-3">
                {activeFreelancerJobs.map((job) => (
                  <div
                    key={job.jobId.toString()}
                    className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        Job #{job.jobId.toString()} •{" "}
                        {decodeCategoryBytes32(job.category)}
                      </span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <Link
                      href={`/jobs/${job.jobId.toString()}`}
                      className="block text-sm font-semibold text-white hover:text-emerald-400"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span>Client:</span>
                        <AddressDisplay address={job.client} showCopy={false} />
                      </div>
                      <span className="font-mono font-semibold text-emerald-400">
                        {formatBotAmount(job.budget)} BOT
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#232B3E] flex items-center justify-between">
                      <Link
                        href={`/jobs/${job.jobId.toString()}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                      >
                        Job Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      {job.status === 2 && (
                        <button
                          type="button"
                          onClick={() => executeWrite("confirmHire", [job.jobId])}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
                        >
                          Confirm Hire Agreement
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AS CLIENT */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Active Hires as Client ({activeClientJobs.length})
            </h2>
            {activeClientJobs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">
                No active hires as a client.
              </p>
            ) : (
              <div className="space-y-3">
                {activeClientJobs.map((job) => (
                  <div
                    key={job.jobId.toString()}
                    className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        Job #{job.jobId.toString()} •{" "}
                        {decodeCategoryBytes32(job.category)}
                      </span>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <Link
                      href={`/jobs/${job.jobId.toString()}`}
                      className="block text-sm font-semibold text-white hover:text-emerald-400"
                    >
                      {job.title}
                    </Link>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span>Freelancer:</span>
                        <AddressDisplay
                          address={job.selectedFreelancer}
                          showCopy={false}
                        />
                      </div>
                      <span className="font-mono font-semibold text-emerald-400">
                        {formatBotAmount(job.budget)} BOT
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#232B3E] flex items-center justify-between">
                      <Link
                        href={`/jobs/${job.jobId.toString()}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                      >
                        Job Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                      {job.status === 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            executeWrite("markJobCompleted", [job.jobId])
                          }
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                        </button>
                      )}
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
