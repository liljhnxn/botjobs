"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { User, FileText, ArrowUpRight, Loader2 } from "lucide-react";
import {
  useFreelancerProfile,
  useFreelancerApplications,
  useFreelancerJobs,
  OnChainApplication,
  OnChainJob,
} from "../../../lib/useBotJobs";
import { formatBotAmount, formatTimestamp } from "../../../lib/format";
import {
  ApplicationStatusBadge,
  JobStatusBadge,
} from "../../../components/StatusBadge";
import { ContractNotConfiguredBanner } from "../../../components/ContractNotConfiguredBanner";

export default function FreelancerDashboardPage() {
  const { address, isConnected } = useAccount();
  const { exists, profile, isLoading: profileLoading } =
    useFreelancerProfile(address);
  const { data: rawApps, isLoading: appsLoading } =
    useFreelancerApplications(address);
  const { data: rawJobs, isLoading: jobsLoading } = useFreelancerJobs(address);

  const applications = (rawApps as OnChainApplication[] | undefined) || [];
  const jobs = (rawJobs as OnChainJob[] | undefined) || [];

  const pendingApps = applications.filter(
    (a) => a.status === 0 || a.status === 1
  );
  const rejectedApps = applications.filter((a) => a.status === 3);
  const acceptedJobs = jobs.filter((j) => j.status === 2);
  const activeWork = jobs.filter((j) => j.status === 3);
  const completedWork = jobs.filter((j) => j.status === 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Freelancer Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor your on-chain profile, submitted proposals, accepted agreements, and completed work.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs font-medium text-white hover:border-emerald-500/40"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            {exists ? "Edit Profile" : "Create Profile"}
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950"
          >
            Browse Open Jobs
          </Link>
        </div>
      </div>

      <ContractNotConfiguredBanner />

      {!isConnected ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-2">
          <User className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-white">
            Connect your wallet to load your Freelancer Dashboard
          </p>
        </div>
      ) : profileLoading || appsLoading || jobsLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* PROFILE SUMMARY CARD */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                My On-Chain Profile Status
              </span>
              {exists && profile ? (
                <div>
                  <h2 className="text-base font-semibold text-white">
                    {profile.displayName} •{" "}
                    <span className="text-emerald-400 font-mono">
                      {formatBotAmount(profile.hourlyRate)} BOT/hr
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">{profile.headline}</p>
                </div>
              ) : (
                <p className="text-xs text-amber-300">
                  You have not created an on-chain freelancer profile yet.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {address && (
                <Link
                  href={`/profile/${address}`}
                  className="px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-slate-300 hover:text-white"
                >
                  Public View
                </Link>
              )}
              <Link
                href="/profile"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-medium text-emerald-300"
              >
                {exists ? "Update Profile" : "Create Profile"}
              </Link>
            </div>
          </div>

          {/* REAL ON-CHAIN COUNTS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Proposals", value: applications.length },
              { label: "Pending / Shortlist", value: pendingApps.length },
              { label: "Accepted (Confirm)", value: acceptedJobs.length },
              { label: "Active Work", value: activeWork.length },
              { label: "Completed Work", value: completedWork.length },
              { label: "Rejected", value: rejectedApps.length },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-[#11151F] border border-[#232B3E] p-4 space-y-1"
              >
                <span className="text-[11px] text-slate-400 block">
                  {stat.label}
                </span>
                <span className="text-xl font-bold font-mono text-white">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* APPLICATIONS */}
            <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  Recent Applications ({applications.length})
                </h2>
                <Link
                  href="/applications"
                  className="text-xs text-emerald-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  You haven&apos;t applied to any jobs.
                </p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.applicationId.toString()}
                      className="p-3.5 rounded-lg bg-[#161B28] border border-[#232B3E] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-300">
                            Proposal #{app.applicationId.toString()} (Job #
                            {app.jobId.toString()})
                          </span>
                          <ApplicationStatusBadge status={app.status} />
                        </div>
                        <div className="text-xs text-slate-400">
                          Proposed:{" "}
                          <span className="text-emerald-400 font-mono">
                            {formatBotAmount(app.proposedBudget)} BOT
                          </span>{" "}
                          • {app.estimatedDays.toString()} days
                        </div>
                      </div>
                      <Link
                        href={`/applications/${app.applicationId.toString()}`}
                        className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1"
                      >
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ASSIGNED / ACCEPTED JOBS */}
            <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  Assigned Jobs ({jobs.length})
                </h2>
                <Link
                  href="/work"
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Manage Work
                </Link>
              </div>

              {jobs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  No accepted or completed jobs yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.jobId.toString()}
                      className="p-3.5 rounded-lg bg-[#161B28] border border-[#232B3E] flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            Job #{job.jobId.toString()}
                          </span>
                          <JobStatusBadge status={job.status} />
                        </div>
                        <Link
                          href={`/jobs/${job.jobId.toString()}`}
                          className="text-sm font-semibold text-white hover:text-emerald-400 block"
                        >
                          {job.title}
                        </Link>
                        <span className="text-xs font-mono text-emerald-400">
                          {formatBotAmount(job.budget)} BOT
                        </span>
                      </div>
                      <Link
                        href={`/jobs/${job.jobId.toString()}`}
                        className="text-xs text-slate-300 hover:text-white inline-flex items-center gap-1"
                      >
                        Open <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
