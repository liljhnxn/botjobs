"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Calendar, Users, ArrowUpRight, Clock } from "lucide-react";
import { OnChainJob } from "../lib/useBotJobs";
import { decodeCategoryBytes32 } from "../lib/contracts";
import {
  formatBotAmount,
  formatTimestamp,
  isDeadlineExpired,
} from "../lib/format";
import { JobStatusBadge } from "./StatusBadge";
import { AddressDisplay } from "./AddressDisplay";

export function JobCard({ job }: { job: OnChainJob }) {
  const { address, isConnected } = useAccount();
  const categoryName = decodeCategoryBytes32(job.category);
  const expired = isDeadlineExpired(job.applicationDeadline);

  const isClient =
    Boolean(isConnected && address && address.toLowerCase() === job.client.toLowerCase());

  const canApply =
    isConnected &&
    address &&
    !isClient &&
    !expired &&
    job.status === 0; // OPEN

  return (
    <div className="rounded-xl bg-[#11151F] border border-[#232B3E] hover:border-emerald-500/40 p-5 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#161B28] border border-[#232B3E] text-xs font-medium text-slate-300">
              {categoryName}
            </span>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="text-right shrink-0">
            <span className="text-base font-bold text-emerald-400 font-mono">
              {formatBotAmount(job.budget)} BOT
            </span>
          </div>
        </div>

        <div>
          <Link
            href={`/jobs/${job.jobId.toString()}`}
            className="text-base font-semibold text-white hover:text-emerald-400 transition-colors line-clamp-1"
          >
            {job.title}
          </Link>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#232B3E]/80 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              Client
            </span>
            <AddressDisplay address={job.client} showCopy={false} />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              Deadline
            </span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Clock className="w-3 h-3 text-slate-500" />
              {formatTimestamp(job.applicationDeadline)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="block text-[10px] uppercase tracking-wider text-slate-500">
              Proposals
            </span>
            <span className="inline-flex items-center gap-1 text-slate-300 font-mono">
              <Users className="w-3 h-3 text-slate-500" />
              {job.applicationCount.toString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            href={`/jobs/${job.jobId.toString()}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161B28] hover:bg-[#1E2536] border border-[#232B3E] text-xs font-medium text-white transition-colors w-full"
          >
            View Job <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {canApply ? (
            <Link
              href={`/jobs/${job.jobId.toString()}/apply`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 transition-colors w-full"
            >
              Apply Now
            </Link>
          ) : !isConnected ? (
            <Link
              href={`/jobs/${job.jobId.toString()}`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors w-full"
            >
              Connect to Apply
            </Link>
          ) : isClient ? (
            <span className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-slate-500 w-full text-center">
              Your Job (Client)
            </span>
          ) : expired ? (
            <span className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 w-full text-center">
              Deadline Expired
            </span>
          ) : (
            <span className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 w-full text-center">
              {job.status === 4 ? "Completed" : "Not Open"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
