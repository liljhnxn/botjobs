"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { FileText, ArrowUpRight, XCircle, Loader2 } from "lucide-react";
import {
  useFreelancerApplications,
  useBotJobsWrite,
  OnChainApplication,
} from "../../lib/useBotJobs";
import { formatBotAmount, formatDateTime } from "../../lib/format";
import { ApplicationStatusBadge } from "../../components/StatusBadge";
import { TransactionStatusBanner } from "../../components/TransactionStatusBanner";
import { ContractNotConfiguredBanner } from "../../components/ContractNotConfiguredBanner";

export default function MyApplicationsPage() {
  const { address, isConnected } = useAccount();
  const {
    data: rawApps,
    isLoading,
    refetch,
  } = useFreelancerApplications(address);
  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  useEffect(() => {
    if (txState === "success") {
      refetch();
    }
  }, [txState, refetch]);

  const applications = (rawApps as OnChainApplication[] | undefined) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          My Submitted Applications
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track the on-chain status of every job proposal submitted from your wallet.
        </p>
      </div>

      <ContractNotConfiguredBanner />

      <TransactionStatusBanner
        state={txState}
        txHash={txHash}
        errorMessage={errorMessage}
        onReset={resetTx}
        successMessage="Application withdrawn on-chain."
      />

      {!isConnected ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-2">
          <FileText className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-white">
            Connect your wallet to view your applications
          </p>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-3">
          <FileText className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">
            You haven&apos;t applied to any jobs.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs"
          >
            Browse Open Jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => (
            <div
              key={app.applicationId.toString()}
              className="rounded-xl bg-[#11151F] border border-[#232B3E] p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Application #{app.applicationId.toString()} • Job #
                    {app.jobId.toString()}
                  </span>
                  <ApplicationStatusBadge status={app.status} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {app.proposal}
                </p>
              </div>

              <div className="pt-3 border-t border-[#232B3E] space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="block text-slate-500">Proposed</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {formatBotAmount(app.proposedBudget)} BOT
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Timeline</span>
                    <span className="text-white">
                      {app.estimatedDays.toString()} days
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Submitted</span>
                    <span className="text-slate-300">
                      {formatDateTime(app.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/applications/${app.applicationId.toString()}`}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                  >
                    Application Details <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${app.jobId.toString()}`}
                      className="px-3 py-1.5 rounded bg-[#161B28] border border-[#232B3E] text-white hover:bg-[#1E2536]"
                    >
                      View Job
                    </Link>

                    {app.status === 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          executeWrite("withdrawApplication", [
                            app.applicationId,
                          ])
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
