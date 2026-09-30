"use client";

import React, { useState } from "react";
import Link from "next/link";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeft, PlusCircle, ShieldCheck } from "lucide-react";
import {
  JOB_CATEGORIES,
  encodeCategoryBytes32,
} from "../../../lib/contracts";
import { useBotJobsWrite } from "../../../lib/useBotJobs";
import { TransactionStatusBanner } from "../../../components/TransactionStatusBanner";
import { ContractNotConfiguredBanner } from "../../../components/ContractNotConfiguredBanner";
import { AddressDisplay } from "../../../components/AddressDisplay";

export default function CreateJobPage() {
  const { address, isConnected } = useAccount();
  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(JOB_CATEGORIES[0]);
  const [budgetBot, setBudgetBot] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Job title cannot be empty.");
      return;
    }
    if (title.trim().length > 120) {
      setValidationError("Job title cannot exceed 120 characters.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Job description cannot be empty.");
      return;
    }
    if (description.trim().length > 4000) {
      setValidationError("Job description cannot exceed 4000 characters.");
      return;
    }
    if (!budgetBot || isNaN(Number(budgetBot)) || Number(budgetBot) <= 0) {
      setValidationError("Budget must be greater than 0 BOT.");
      return;
    }
    if (!deadlineDate) {
      setValidationError("Please select an application deadline.");
      return;
    }

    const deadlineSeconds = Math.floor(new Date(deadlineDate).getTime() / 1000);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (deadlineSeconds <= nowSeconds) {
      setValidationError("Application deadline must be in the future.");
      return;
    }

    try {
      const budgetWei = parseEther(budgetBot.trim());
      const categoryBytes32 = encodeCategoryBytes32(category);

      await executeWrite("createJob", [
        title.trim(),
        description.trim(),
        metadataURI.trim(),
        categoryBytes32,
        budgetWei,
        BigInt(deadlineSeconds),
      ]);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Invalid form input."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Post a New Web3 Job
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Publish an on-chain job specification on Botchain. Payment custody is handled separately via BotEscrow after hiring.
        </p>
      </div>

      <ContractNotConfiguredBanner />

      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#232B3E] text-xs">
          <span className="text-slate-400">Client Wallet</span>
          {isConnected && address ? (
            <AddressDisplay address={address} />
          ) : (
            <span className="text-amber-400">Wallet not connected</span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="job-title"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Job Title * <span className="text-slate-500">(Max 120 chars)</span>
            </label>
            <input
              id="job-title"
              type="text"
              maxLength={120}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Audit & Deploy Solidity Staking Vault on Botchain"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="job-category"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Category *
              </label>
              <select
                id="job-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="job-budget"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Budget (BOT) *
              </label>
              <input
                id="job-budget"
                type="number"
                step="any"
                min="0.0001"
                required
                value={budgetBot}
                onChange={(e) => setBudgetBot(e.target.value)}
                placeholder="e.g., 500"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="job-deadline"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Application Deadline *
              </label>
              <input
                id="job-deadline"
                type="datetime-local"
                required
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="job-description"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              Job Description & Deliverables *{" "}
              <span className="text-slate-500">(Max 4000 chars)</span>
            </label>
            <textarea
              id="job-description"
              rows={6}
              maxLength={4000}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of work, technical requirements, milestones, and acceptance criteria..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="job-metadata-uri"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              External Specification / Metadata URI{" "}
              <span className="text-slate-500">(Optional, e.g. ipfs:// or https://)</span>
            </label>
            <input
              id="job-metadata-uri"
              type="text"
              maxLength={512}
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="ipfs://Qm... or https://github.com/..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="rounded-lg bg-[#161B28]/80 border border-[#232B3E] p-3.5 flex items-start gap-3 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Creating a job on BotJobs does not lock your BOT tokens upfront. Once you accept a freelancer and they confirm the hire, payment custody is established through <strong>BotEscrow</strong>.
            </span>
          </div>

          {validationError && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              {validationError}
            </div>
          )}

          <TransactionStatusBanner
            state={txState}
            txHash={txHash}
            errorMessage={errorMessage}
            onReset={resetTx}
            successMessage="Job created and confirmed on Botchain!"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="submit-create-job"
              type="submit"
              disabled={
                txState === "wallet_confirmation" ||
                txState === "submitted" ||
                txState === "confirming"
              }
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              Publish Job On-Chain
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
