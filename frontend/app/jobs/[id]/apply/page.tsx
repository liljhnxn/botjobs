"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeft, Send, CheckCircle2, Eye } from "lucide-react";
import {
  useJob,
  useHasFreelancerApplied,
  useBotJobsWrite,
  OnChainJob,
} from "../../../../lib/useBotJobs";
import {
  formatBotAmount,
  formatDateTime,
  isDeadlineExpired,
} from "../../../../lib/format";
import { AddressDisplay } from "../../../../components/AddressDisplay";
import { TransactionStatusBanner } from "../../../../components/TransactionStatusBanner";

export default function ApplyForJobPage() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const jobId = rawId && !isNaN(Number(rawId)) ? BigInt(rawId) : undefined;

  const { address, isConnected } = useAccount();
  const { data: rawJob, isLoading } = useJob(jobId);
  const { data: alreadyApplied } = useHasFreelancerApplied(jobId, address);
  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  const [proposal, setProposal] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [portfolioURI, setPortfolioURI] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const job = rawJob as OnChainJob | undefined;

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading job details...
      </div>
    );
  }

  if (!job || job.jobId === 0n) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm text-white font-semibold">Job not found.</p>
        <Link href="/jobs" className="text-xs text-emerald-400 hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const expired = isDeadlineExpired(job.applicationDeadline);
  const isClient =
    isConnected &&
    address &&
    address.toLowerCase() === job.client.toLowerCase();

  const handleReviewToggle = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!proposal.trim()) {
      setValidationError("Proposal cannot be empty.");
      return;
    }
    if (
      !proposedBudget ||
      isNaN(Number(proposedBudget)) ||
      Number(proposedBudget) <= 0
    ) {
      setValidationError("Proposed budget must be greater than 0 BOT.");
      return;
    }
    if (
      !estimatedDays ||
      isNaN(Number(estimatedDays)) ||
      Number(estimatedDays) <= 0
    ) {
      setValidationError("Estimated completion days must be greater than 0.");
      return;
    }

    setShowReview(true);
  };

  const handleConfirmSubmit = async () => {
    if (!jobId) return;
    try {
      const budgetWei = parseEther(proposedBudget.trim());
      await executeWrite("applyForJob", [
        jobId,
        proposal.trim(),
        budgetWei,
        BigInt(Math.floor(Number(estimatedDays))),
        portfolioURI.trim(),
      ]);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Invalid application parameters."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/jobs/${job.jobId.toString()}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Job #{job.jobId.toString()}
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Apply for: {job.title}
        </h1>
      </div>

      {/* JOB SUMMARY HEADER */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="block text-slate-500">Job Budget</span>
          <span className="font-mono font-semibold text-emerald-400">
            {formatBotAmount(job.budget)} BOT
          </span>
        </div>
        <div>
          <span className="block text-slate-500">Application Deadline</span>
          <span className="text-slate-200">
            {formatDateTime(job.applicationDeadline)}
          </span>
        </div>
        <div>
          <span className="block text-slate-500">Client</span>
          <AddressDisplay address={job.client} showCopy={false} />
        </div>
        <div>
          <span className="block text-slate-500">Applicant Wallet</span>
          {address ? (
            <AddressDisplay address={address} showCopy={false} />
          ) : (
            <span className="text-amber-400">Not connected</span>
          )}
        </div>
      </div>

      {isClient && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300">
          You are the client who posted this job. Clients cannot apply to their own jobs.
        </div>
      )}

      {Boolean(alreadyApplied) && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-300">
          You have already submitted an on-chain application for this job.
        </div>
      )}

      {expired && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-300">
          The application deadline for this job has passed.
        </div>
      )}

      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 sm:p-8 space-y-6">
        {!showReview ? (
          <form onSubmit={handleReviewToggle} className="space-y-5">
            <div>
              <label
                htmlFor="proposal-input"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Proposal & Technical Approach *{" "}
                <span className="text-slate-500">(Max 3000 chars)</span>
              </label>
              <textarea
                id="proposal-input"
                rows={6}
                maxLength={3000}
                required
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Explain your relevant experience, architecture plan, and delivery milestones..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="proposed-budget-input"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Proposed Budget (BOT) *
                </label>
                <input
                  id="proposed-budget-input"
                  type="number"
                  step="any"
                  min="0.0001"
                  required
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder="e.g., 450"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="estimated-days-input"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Estimated Completion Days *
                </label>
                <input
                  id="estimated-days-input"
                  type="number"
                  min="1"
                  required
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="e.g., 14"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="portfolio-uri-input"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Portfolio / GitHub / Metadata URI{" "}
                <span className="text-slate-500">(Max 512 chars)</span>
              </label>
              <input
                id="portfolio-uri-input"
                type="text"
                maxLength={512}
                value={portfolioURI}
                onChange={(e) => setPortfolioURI(e.target.value)}
                placeholder="https://github.com/yourhandle or ipfs://..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {validationError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {validationError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                id="review-application-btn"
                type="submit"
                disabled={Boolean(isClient || alreadyApplied || expired)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Review Application Summary
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#232B3E] pb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Review Application Before Wallet Signature
              </h2>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Edit Proposal
              </button>
            </div>

            <div className="rounded-lg bg-[#161B28] border border-[#232B3E] p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Proposed Budget</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {proposedBudget} BOT
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estimated Timeline</span>
                  <span className="text-white font-semibold text-sm">
                    {estimatedDays} Days
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Portfolio URI</span>
                <span className="text-slate-300 font-mono">
                  {portfolioURI || "None provided"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Proposal Text</span>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {proposal}
                </p>
              </div>
            </div>

            <TransactionStatusBanner
              state={txState}
              txHash={txHash}
              errorMessage={errorMessage}
              onReset={resetTx}
              successMessage="Application submitted and confirmed on Botchain!"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReview(false)}
                className="px-4 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-slate-300 hover:text-white"
              >
                Back to Edit
              </button>
              <button
                id="confirm-submit-application"
                type="button"
                onClick={handleConfirmSubmit}
                disabled={
                  txState === "wallet_confirmation" ||
                  txState === "submitted" ||
                  txState === "confirming"
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Submit Application On-Chain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
