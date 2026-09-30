"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import {
  ArrowLeft,
  ExternalLink,
  XCircle,
  CheckCircle2,
  Star,
  Loader2,
} from "lucide-react";
import {
  useApplication,
  useJob,
  useBotJobsWrite,
  OnChainApplication,
  OnChainJob,
} from "../../../lib/useBotJobs";
import { formatBotAmount, formatDateTime } from "../../../lib/format";
import {
  ApplicationStatusBadge,
  JobStatusBadge,
} from "../../../components/StatusBadge";
import { AddressDisplay } from "../../../components/AddressDisplay";
import { TransactionStatusBanner } from "../../../components/TransactionStatusBanner";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const appId = rawId && !isNaN(Number(rawId)) ? BigInt(rawId) : undefined;

  const { address, isConnected } = useAccount();
  const {
    data: rawApp,
    isLoading: appLoading,
    refetch: refetchApp,
  } = useApplication(appId);

  const app = rawApp as OnChainApplication | undefined;
  const { data: rawJob, refetch: refetchJob } = useJob(app?.jobId);
  const job = rawJob as OnChainJob | undefined;

  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  useEffect(() => {
    if (txState === "success") {
      refetchApp();
      refetchJob();
    }
  }, [txState, refetchApp, refetchJob]);

  if (appLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
      </div>
    );
  }

  if (!app || app.applicationId === 0n) {
    return (
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-10 text-center space-y-3">
        <p className="text-sm font-semibold text-white">Application Not Found</p>
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </Link>
      </div>
    );
  }

  const isApplicant =
    isConnected &&
    address &&
    address.toLowerCase() === app.freelancer.toLowerCase();
  const isClient =
    isConnected &&
    address &&
    job &&
    address.toLowerCase() === job.client.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Application #{app.applicationId.toString()}
          </h1>
          <ApplicationStatusBadge status={app.status} />
        </div>
      </div>

      <TransactionStatusBanner
        state={txState}
        txHash={txHash}
        errorMessage={errorMessage}
        onReset={resetTx}
      />

      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-5">
        {job && (
          <div className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 block">
                Target Job #{job.jobId.toString()}
              </span>
              <Link
                href={`/jobs/${job.jobId.toString()}`}
                className="text-sm font-semibold text-white hover:text-emerald-400"
              >
                {job.title}
              </Link>
            </div>
            <JobStatusBadge status={job.status} />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-slate-500">Applicant</span>
            <AddressDisplay address={app.freelancer} />
          </div>
          <div>
            <span className="block text-slate-500">Proposed Budget</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatBotAmount(app.proposedBudget)} BOT
            </span>
          </div>
          <div>
            <span className="block text-slate-500">Estimated Days</span>
            <span className="text-white font-semibold">
              {app.estimatedDays.toString()} Days
            </span>
          </div>
          <div>
            <span className="block text-slate-500">Submitted At</span>
            <span className="text-slate-300">
              {formatDateTime(app.createdAt)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#232B3E] space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Proposal Details
          </h2>
          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
            {app.proposal}
          </p>
        </div>

        {app.portfolioURI && (
          <div className="pt-4 border-t border-[#232B3E]">
            <span className="block text-xs text-slate-400 mb-1">
              Portfolio / External Reference URI
            </span>
            <a
              href={
                app.portfolioURI.startsWith("http")
                  ? app.portfolioURI
                  : `https://ipfs.io/ipfs/${app.portfolioURI.replace("ipfs://", "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline break-all"
            >
              {app.portfolioURI} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-[#232B3E] flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/profile/${app.freelancer}`}
            className="text-xs text-emerald-400 hover:underline"
          >
            View Freelancer Profile →
          </Link>

          <div className="flex items-center gap-2">
            {isApplicant && app.status === 0 && (
              <button
                type="button"
                onClick={() =>
                  executeWrite("withdrawApplication", [app.applicationId])
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs font-medium text-rose-300 hover:bg-rose-500/25"
              >
                <XCircle className="w-4 h-4" /> Withdraw Application
              </button>
            )}

            {isClient &&
              job &&
              (job.status === 0 || job.status === 1) &&
              (app.status === 0 || app.status === 1) && (
                <>
                  {app.status === 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        executeWrite("shortlistApplication", [app.applicationId])
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300"
                    >
                      <Star className="w-3.5 h-3.5" /> Shortlist
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      executeWrite("rejectApplication", [app.applicationId])
                    }
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      executeWrite("acceptApplication", [app.applicationId])
                    }
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Hire
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
