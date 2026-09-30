"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import {
  Briefcase,
  PlusCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useClientJobs, OnChainJob } from "../../../lib/useBotJobs";
import { decodeCategoryBytes32 } from "../../../lib/contracts";
import { formatBotAmount, formatTimestamp } from "../../../lib/format";
import { JobStatusBadge } from "../../../components/StatusBadge";
import { AddressDisplay } from "../../../components/AddressDisplay";
import { ContractNotConfiguredBanner } from "../../../components/ContractNotConfiguredBanner";

export default function ClientDashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: rawJobs, isLoading } = useClientJobs(address);

  const jobs = (rawJobs as OnChainJob[] | undefined) || [];

  const openJobs = jobs.filter((j) => j.status === 0 || j.status === 1);
  const jobsWithApplications = jobs.filter((j) => j.applicationCount > 0n);
  const activeHires = jobs.filter((j) => j.status === 2 || j.status === 3);
  const completedJobs = jobs.filter((j) => j.status === 4);
  const cancelledJobs = jobs.filter((j) => j.status === 5);
  const totalApplicationsReceived = jobs.reduce(
    (acc, j) => acc + Number(j.applicationCount),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Client Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time overview of your posted jobs, applications received, and active hires on Botchain.
          </p>
        </div>

        <Link
          href="/jobs/create"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950"
        >
          <PlusCircle className="w-4 h-4" /> Post New Job
        </Link>
      </div>

      <ContractNotConfiguredBanner />

      {!isConnected ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-white">
            Connect your wallet to load your Client Dashboard
          </p>
        </div>
      ) : isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* REAL BLOCKCHAIN METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[
              { label: "Jobs Posted", value: jobs.length, icon: Briefcase },
              { label: "Open / Review", value: openJobs.length, icon: Clock },
              {
                label: "With Proposals",
                value: jobsWithApplications.length,
                icon: Users,
              },
              {
                label: "Proposals Recv.",
                value: totalApplicationsReceived,
                icon: Users,
              },
              { label: "Active Hires", value: activeHires.length, icon: Clock },
              {
                label: "Completed",
                value: completedJobs.length,
                icon: CheckCircle2,
              },
              {
                label: "Cancelled",
                value: cancelledJobs.length,
                icon: XCircle,
              },
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

          {jobs.length === 0 ? (
            <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-white">
                You haven&apos;t posted any jobs.
              </p>
              <Link
                href="/jobs/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs"
              >
                <PlusCircle className="w-4 h-4" /> Create Your First Job
              </Link>
            </div>
          ) : (
            <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">
                Your Posted Jobs ({jobs.length})
              </h2>

              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.jobId.toString()}
                    className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          Job #{job.jobId.toString()}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#11151F] border border-[#232B3E] text-[11px] text-slate-300">
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
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span>
                          Budget:{" "}
                          <strong className="text-emerald-400 font-mono">
                            {formatBotAmount(job.budget)} BOT
                          </strong>
                        </span>
                        <span>
                          Proposals:{" "}
                          <strong className="text-white font-mono">
                            {job.applicationCount.toString()}
                          </strong>
                        </span>
                        <span>
                          Deadline: {formatTimestamp(job.applicationDeadline)}
                        </span>
                        {job.selectedFreelancer &&
                          job.selectedFreelancer !==
                            "0x0000000000000000000000000000000000000000" && (
                            <span className="inline-flex items-center gap-1">
                              Freelancer:{" "}
                              <AddressDisplay
                                address={job.selectedFreelancer}
                                showCopy={false}
                              />
                            </span>
                          )}
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${job.jobId.toString()}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#11151F] hover:bg-[#1E2536] border border-[#232B3E] text-xs font-medium text-white shrink-0 self-start md:self-center"
                    >
                      Manage Job & Proposals <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
