"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { parseEther, formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  User,
  Save,
  Plus,
  X,
  PowerOff,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { RECOMMENDED_SKILLS } from "../../lib/contracts";
import {
  useFreelancerProfile,
  useBotJobsWrite,
} from "../../lib/useBotJobs";
import { AddressDisplay } from "../../components/AddressDisplay";
import { TransactionStatusBanner } from "../../components/TransactionStatusBanner";
import { ContractNotConfiguredBanner } from "../../components/ContractNotConfiguredBanner";

export default function MyProfileEditorPage() {
  const { address, isConnected } = useAccount();
  const { exists, profile, isLoading, refetch } = useFreelancerProfile(address);
  const { executeWrite, txState, txHash, errorMessage, resetTx } =
    useBotJobsWrite();

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>(["Solidity", "TypeScript"]);
  const [customSkill, setCustomSkill] = useState("");
  const [portfolioURI, setPortfolioURI] = useState("");
  const [hourlyRateBot, setHourlyRateBot] = useState("25");
  const [active, setActive] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (exists && profile) {
      setDisplayName(profile.displayName);
      setHeadline(profile.headline);
      setBio(profile.bio);
      setSkills([...profile.skills]);
      setPortfolioURI(profile.portfolioURI);
      setHourlyRateBot(formatEther(profile.hourlyRate));
      setActive(profile.active);
    }
  }, [exists, profile]);

  useEffect(() => {
    if (txState === "success") {
      refetch();
    }
  }, [txState, refetch]);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else if (skills.length < 25) {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) {
      setValidationError("Skill name cannot exceed 50 characters.");
      return;
    }
    if (skills.length >= 25) {
      setValidationError("Maximum 25 skills allowed.");
      return;
    }
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setCustomSkill("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!displayName.trim()) {
      setValidationError("Display name cannot be empty.");
      return;
    }
    if (displayName.trim().length > 80) {
      setValidationError("Display name cannot exceed 80 characters.");
      return;
    }
    if (headline.trim().length > 150) {
      setValidationError("Headline cannot exceed 150 characters.");
      return;
    }
    if (bio.trim().length > 1000) {
      setValidationError("Bio cannot exceed 1000 characters.");
      return;
    }
    if (portfolioURI.trim().length > 512) {
      setValidationError("Portfolio URI cannot exceed 512 characters.");
      return;
    }

    try {
      const rateWei = parseEther(hourlyRateBot.trim() || "0");
      if (exists) {
        await executeWrite("updateProfile", [
          displayName.trim(),
          headline.trim(),
          bio.trim(),
          skills,
          portfolioURI.trim(),
          rateWei,
          active,
        ]);
      } else {
        await executeWrite("createProfile", [
          displayName.trim(),
          headline.trim(),
          bio.trim(),
          skills,
          portfolioURI.trim(),
          rateWei,
        ]);
      }
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Invalid profile inputs."
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {exists ? "Update On-Chain Profile" : "Create Freelancer Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish your professional Web3 profile directly on Botchain. Do not store private personal data on-chain.
          </p>
        </div>

        {isConnected && address && (
          <Link
            href={`/profile/${address}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            View Public Profile <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <ContractNotConfiguredBanner />

      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#232B3E] text-xs">
          <span className="text-slate-400">Connected Freelancer Wallet</span>
          {isConnected && address ? (
            <AddressDisplay address={address} />
          ) : (
            <span className="text-amber-400">Wallet not connected</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-display-name"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Display Name * <span className="text-slate-500">(Max 80)</span>
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  maxLength={80}
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Alex Protocol Engineer"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-hourly-rate"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Hourly Rate (BOT / hr) *
                </label>
                <input
                  id="profile-hourly-rate"
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={hourlyRateBot}
                  onChange={(e) => setHourlyRateBot(e.target.value)}
                  placeholder="e.g., 40"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-headline"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Professional Headline{" "}
                <span className="text-slate-500">(Max 150)</span>
              </label>
              <input
                id="profile-headline"
                type="text"
                maxLength={150}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Smart Contract Auditor & Full-Stack Web3 Architect"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label
                htmlFor="profile-bio"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Concise Bio <span className="text-slate-500">(Max 1000)</span>
              </label>
              <textarea
                id="profile-bio"
                rows={4}
                maxLength={1000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Summarize your technical background and focus areas..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* SKILLS SELECTION */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Self-Reported Skills{" "}
                <span className="text-slate-500">
                  ({skills.length}/25 selected — Note: self-entered skills are not verified credentials)
                </span>
              </label>

              <div className="flex flex-wrap gap-2">
                {RECOMMENDED_SKILLS.map((skill) => {
                  const selected = skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-[#161B28] text-slate-400 border-[#232B3E] hover:text-white"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="custom-skill-input"
                  type="text"
                  maxLength={50}
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add custom skill..."
                  className="px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-emerald-400 hover:bg-[#1E2536]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Skill
                </button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#161B28] border border-[#232B3E] text-xs text-slate-200"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="profile-portfolio-uri"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Portfolio / Metadata URI{" "}
                <span className="text-slate-500">(Max 512 chars)</span>
              </label>
              <input
                id="profile-portfolio-uri"
                type="text"
                maxLength={512}
                value={portfolioURI}
                onChange={(e) => setPortfolioURI(e.target.value)}
                placeholder="https://... or ipfs://..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {exists && (
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#161B28] border border-[#232B3E]">
                <div>
                  <span className="text-xs font-medium text-white block">
                    Availability Status
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Indicate whether you are actively accepting new jobs
                  </span>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-emerald-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-[#232B3E] bg-[#11151F]"
                  />
                  <span>{active ? "Active" : "Inactive"}</span>
                </label>
              </div>
            )}

            {validationError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {validationError}
              </div>
            )}

            <TransactionStatusBanner
              state={txState}
              txHash={txHash}
              errorMessage={errorMessage}
              onReset={resetTx}
              successMessage="Freelancer profile saved on Botchain!"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {exists && profile?.active ? (
                <button
                  type="button"
                  onClick={() => executeWrite("deactivateProfile", [])}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs font-medium text-rose-300 hover:bg-rose-500/25"
                >
                  <PowerOff className="w-3.5 h-3.5" /> Deactivate Profile
                </button>
              ) : (
                <div />
              )}

              <button
                id="save-profile-btn"
                type="submit"
                disabled={
                  txState === "wallet_confirmation" ||
                  txState === "submitted" ||
                  txState === "confirming"
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {exists ? "Update Profile On-Chain" : "Create Profile On-Chain"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
