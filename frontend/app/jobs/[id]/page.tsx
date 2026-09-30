"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  Loader2,
  Users,
} from "lucide-react";
import {
  useJob,
  useJobApplications,
  useBotJobsWrite,
  useJobEscrowInfo,
  OnChainJob,
  OnChainApplication,
} from "../../../lib/useBotJobs";
import {
  decodeCategoryBytes32,
  CONTRACT_CONFIG,
} from "../../../lib/contracts";
import {
  formatBotAmount,
  formatDateTime,
  isDeadlineExpired,
} from "../../../lib/format";
import {
  JobStatusBadge,
  ApplicationStatusBadge,
} from "../../../components/StatusBadge";
import { AddressDisplay } from "../../../components/AddressDisplay";
import { TransactionStatusBanner } from "../../../components/TransactionStatusBanner";

export default function JobDetailsPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const jobId = rawId && !isNaN(Number(rawId)) ? BigInt(rawId) : undefined;

  const { address, isConnected } = useAccount();
  const {
    data: rawJob,
    isLoading: jobLoading,
    error: jobError,
    refetch: refetchJob,
  } = useJob(jobId);

  const {
    data: rawApps,
    isLoading: appsLoading,
    refetch: refetchApps,
  } = useJobApplications(jobId);

  const escrowInfo = useJobEscrowInfo(jobId);
  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  useEffect(() => {
    if (txState === "success") {
      refetchJob();
      refetchApps();
    }
  }, [txState, refetchJob, refetchApps]);

  if (jobLoading) {
    return (
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-3">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading job details from Botchain...</p>
      </div>
    );
  }

  const job = rawJob as OnChainJob | undefined;

  if (jobError || !job || job.jobId === 0n) {
    return (
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-10 text-center space-y-4">
        <p className="text-base font-semibold text-white">Job Not Found</p>
        <p className="text-xs text-slate-400">
          This job ID does not exist on the configured BotJobs contract.
        </p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs
        </Link>
      </div>
    );
  }

  const applications = (rawApps as OnChainApplication[] | undefined) || [];
  const isClient =
    isConnected &&
    address &&
    address.toLowerCase() === job.client.toLowerCase();
  const isSelectedFreelancer =
    isConnected &&
    address &&
    job.selectedFreelancer &&
    address.toLowerCase() === job.selectedFreelancer.toLowerCase();
  const expired = isDeadlineExpired(job.applicationDeadline);

  const canApply =
    isConnected &&
    address &&
    !isClient &&
    !expired &&
    (job.status === 0 || job.status === 1);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                Job #{job.jobId.toString()}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#161B28] border border-[#232B3E] text-xs text-slate-300">
                {decodeCategoryBytes32(job.category)}
              </span>
              <JobStatusBadge status={job.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {job.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-[#11151F] border border-[#232B3E] text-right">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                Job Budget
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {formatBotAmount(job.budget)} BOT
              </span>
            </div>

            {canApply && (
              <Link
                href={`/jobs/${job.jobId.toString()}/apply`}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
              >
                Apply for Job
              </Link>
            )}
          </div>
        </div>
      </div>

      <TransactionStatusBanner
        state={txState}
        txHash={txHash}
        errorMessage={errorMessage}
        onReset={resetTx}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN JOB SPECIFICATION */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <h2 className="text-base font-semibold text-white">
              Job Description & Requirements
            </h2>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>

            {job.metadataURI && (
              <div className="pt-4 border-t border-[#232B3E]">
                <span className="block text-xs text-slate-400 mb-1">
                  External Specification URI:
                </span>
                <a
                  href={
                    job.metadataURI.startsWith("http")
                      ? job.metadataURI
                      : `https://ipfs.io/ipfs/${job.metadataURI.replace("ipfs://", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline break-all"
                >
                  {job.metadataURI} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* CLIENT / FREELANCER WORKFLOW CONTROLS */}
          {(isClient || isSelectedFreelancer) && (
            <div className="rounded-xl bg-[#11151F] border border-emerald-500/30 p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">
                On-Chain Role Controls
              </h2>

              {isSelectedFreelancer && job.status === 2 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#161B28] border border-[#232B3E]">
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">
                      You have been selected for this job!
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Confirm the hiring agreement on-chain to transition this job to IN_PROGRESS.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => executeWrite("confirmHire", [job.jobId])}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shrink-0"
                  >
                    Confirm Hire Agreement
                  </button>
                </div>
              )}

              {isClient && (
                <div className="flex flex-wrap items-center gap-3">
                  {job.status === 3 && (
                    <button
                      type="button"
                      onClick={() => executeWrite("markJobCompleted", [job.jobId])}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Job Completed
                    </button>
                  )}

                  {(job.status === 0 || job.status === 1) && (
                    <button
                      type="button"
                      onClick={() => executeWrite("cancelJob", [job.jobId])}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-semibold text-xs"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Open Job
                    </button>
                  )}

                  {job.status === 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        executeWrite("cancelUnconfirmedHire", [job.jobId, true])
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs"
                    >
                      Cancel Unconfirmed Hire (After Timeout)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* APPLICATIONS LIST */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Submitted Proposals ({applications.length})
              </h2>
            </div>

            {appsLoading ? (
              <p className="text-xs text-slate-400">Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">
                No applications submitted for this job yet.
              </p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.applicationId.toString()}
                    className="rounded-lg bg-[#161B28] border border-[#232B3E] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          Proposal #{app.applicationId.toString()}
                        </span>
                        <AddressDisplay address={app.freelancer} />
                        <Link
                          href={`/profile/${app.freelancer}`}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          View Profile
                        </Link>
                      </div>
                      <ApplicationStatusBadge status={app.status} />
                    </div>

                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {app.proposal}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#232B3E] text-xs text-slate-400">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>
                          Proposed:{" "}
                          <strong className="text-white font-mono">
                            {formatBotAmount(app.proposedBudget)} BOT
                          </strong>
                        </span>
                        <span>
                          Estimated:{" "}
                          <strong className="text-white">
                            {app.estimatedDays.toString()} days
                          </strong>
                        </span>
                        <Link
                          href={`/applications/${app.applicationId.toString()}`}
                          className="text-cyan-400 hover:underline"
                        >
                          Details
                        </Link>
                      </div>

                      {isClient &&
                        (job.status === 0 || job.status === 1) &&
                        (app.status === 0 || app.status === 1) && (
                          <div className="flex items-center gap-2">
                            {app.status === 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  executeWrite("shortlistApplication", [
                                    app.applicationId,
                                  ])
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                              >
                                <Star className="w-3 h-3" /> Shortlist
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                executeWrite("rejectApplication", [
                                  app.applicationId,
                                ])
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                executeWrite("acceptApplication", [
                                  app.applicationId,
                                ])
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Accept & Hire
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR METADATA & BOTESCROW STATUS */}
        <div className="space-y-6">
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">
              On-Chain Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Client</span>
                <AddressDisplay address={job.client} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Selected Freelancer</span>
                <AddressDisplay address={job.selectedFreelancer} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created
                </span>
                <span className="text-slate-200">
                  {formatDateTime(job.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Deadline
                </span>
                <span className={expired ? "text-rose-400" : "text-slate-200"}>
                  {formatDateTime(job.applicationDeadline)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Applications</span>
                <span className="text-slate-200 font-mono">
                  {job.applicationCount.toString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              BotEscrow Custody Status
            </div>

            {!CONTRACT_CONFIG.botEscrowAddress ? (
              <div className="p-3 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-amber-400 font-mono">
                BotEscrow contract not configured.
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Escrow Contract</span>
                  <AddressDisplay address={CONTRACT_CONFIG.botEscrowAddress} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Escrow Linked</span>
                  <span className="font-mono">
                    {escrowInfo.hasEscrow ? "Yes" : "No Escrow Registered"}
                  </span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              BotJobs manages discovery and hiring state. Payment custody, milestones, and disputes are delegated to BotEscrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
