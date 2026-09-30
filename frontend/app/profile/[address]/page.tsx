"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isAddress, Address } from "viem";
import {
  User,
  ExternalLink,
  Award,
  CheckCircle2,
  Briefcase,
  Loader2,
  Globe,
} from "lucide-react";
import {
  useFreelancerProfile,
  useCompletedJobsForFreelancer,
  useBotReputeCredentials,
  useBotNSResolution,
  OnChainWorkHistory,
} from "../../../lib/useBotJobs";
import { decodeCategoryBytes32 } from "../../../lib/contracts";
import { formatBotAmount, formatTimestamp } from "../../../lib/format";
import { AddressDisplay } from "../../../components/AddressDisplay";

export default function PublicFreelancerProfilePage() {
  const params = useParams();
  const rawAddr = Array.isArray(params?.address)
    ? params.address[0]
    : params?.address;
  const validAddr =
    rawAddr && isAddress(rawAddr) ? (rawAddr as Address) : undefined;

  const { exists, profile, isLoading } = useFreelancerProfile(validAddr);
  const { data: rawCompleted } = useCompletedJobsForFreelancer(validAddr);
  const repute = useBotReputeCredentials(validAddr);
  const botNS = useBotNSResolution(validAddr);

  const completedJobs = (rawCompleted as OnChainWorkHistory[] | undefined) || [];

  if (!validAddr) {
    return (
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-10 text-center space-y-2">
        <p className="text-sm font-semibold text-white">Invalid Wallet Address</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PROFILE HEADER */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white">
                {exists && profile ? profile.displayName : "Unregistered Freelancer"}
              </h1>
              {exists && profile && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    profile.active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-700/30 text-slate-400 border-slate-600/30"
                  }`}
                >
                  {profile.active ? "Active" : "Inactive"}
                </span>
              )}
            </div>

            {exists && profile?.headline && (
              <p className="text-sm text-slate-300">{profile.headline}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Wallet:</span>
                <AddressDisplay address={validAddr} />
              </div>

              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-slate-500">BotNS:</span>
                {!botNS.isConfigured ? (
                  <span className="text-slate-400">BotNS resolution unavailable.</span>
                ) : botNS.botName ? (
                  <span className="text-emerald-400 font-mono font-semibold">
                    {botNS.botName}
                  </span>
                ) : (
                  <span className="text-slate-400">No primary .bot name</span>
                )}
              </div>
            </div>
          </div>

          {exists && profile && (
            <div className="px-4 py-3 rounded-xl bg-[#161B28] border border-[#232B3E] text-right shrink-0">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                Hourly Rate
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {formatBotAmount(profile.hourlyRate)} BOT/hr
              </span>
            </div>
          )}
        </div>

        {!exists || !profile ? (
          <p className="text-xs text-slate-400 pt-2 border-t border-[#232B3E]">
            This wallet has not published an on-chain FreelancerProfile struct yet.
          </p>
        ) : (
          <>
            {profile.bio && (
              <div className="pt-4 border-t border-[#232B3E]">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Bio
                </h2>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#232B3E] space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Self-Reported Skills
              </h2>
              {profile.skills.length === 0 ? (
                <p className="text-xs text-slate-500">No skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-[#161B28] border border-[#232B3E] text-xs text-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {profile.portfolioURI && (
              <div className="pt-4 border-t border-[#232B3E]">
                <span className="block text-xs text-slate-400 mb-1">
                  Portfolio URI
                </span>
                <a
                  href={
                    profile.portfolioURI.startsWith("http")
                      ? profile.portfolioURI
                      : `https://ipfs.io/ipfs/${profile.portfolioURI.replace("ipfs://", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline break-all"
                >
                  {profile.portfolioURI} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* BOTREPUTE CREDENTIALS */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <Award className="w-5 h-5 text-cyan-400" />
          BotRepute On-Chain Credentials
        </div>

        {!repute.isConfigured ? (
          <div className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-slate-400 font-mono">
            BotRepute credentials unavailable.
          </div>
        ) : repute.credentials.length === 0 ? (
          <p className="text-xs text-slate-400">
            No verified BotRepute credentials found for this wallet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {repute.credentials.map((cred) => (
              <div
                key={cred.credentialId}
                className="p-3.5 rounded-lg bg-[#161B28] border border-cyan-500/30 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300">
                    {cred.roleType}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Issued: {formatTimestamp(cred.issuedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ON-CHAIN WORK HISTORY */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Verifiable On-Chain Work History ({completedJobs.length})
          </h2>
        </div>

        {completedJobs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">
            No completed work yet.
          </p>
        ) : (
          <div className="space-y-3">
            {completedJobs.map((entry) => (
              <div
                key={entry.jobId.toString()}
                className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      Job #{entry.jobId.toString()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#11151F] border border-[#232B3E] text-[11px] text-slate-300">
                      {decodeCategoryBytes32(entry.category)}
                    </span>
                  </div>
                  <Link
                    href={`/jobs/${entry.jobId.toString()}`}
                    className="text-sm font-semibold text-white hover:text-emerald-400"
                  >
                    {entry.title}
                  </Link>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Client:</span>
                    <AddressDisplay address={entry.client} showCopy={false} />
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {formatBotAmount(entry.budget)} BOT
                  </div>
                  <div className="text-xs text-slate-400">
                    Completed {formatTimestamp(entry.completedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
