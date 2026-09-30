"use client";

import React from "react";
import { JOB_STATUS_LABELS, APPLICATION_STATUS_LABELS } from "../lib/contracts";

export function JobStatusBadge({ status }: { status: number }) {
  const label = JOB_STATUS_LABELS[status] || "UNKNOWN";
  const styles: Record<number, string> = {
    0: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", // OPEN
    1: "bg-amber-500/10 text-amber-400 border-amber-500/30", // IN_REVIEW
    2: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", // HIRED
    3: "bg-blue-500/10 text-blue-400 border-blue-500/30", // IN_PROGRESS
    4: "bg-purple-500/10 text-purple-400 border-purple-500/30", // COMPLETED
    5: "bg-rose-500/10 text-rose-400 border-rose-500/30", // CANCELLED
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {label.replace("_", " ")}
    </span>
  );
}

export function ApplicationStatusBadge({ status }: { status: number }) {
  const label = APPLICATION_STATUS_LABELS[status] || "UNKNOWN";
  const styles: Record<number, string> = {
    0: "bg-slate-500/10 text-slate-300 border-slate-500/30", // PENDING
    1: "bg-amber-500/10 text-amber-400 border-amber-500/30", // SHORTLISTED
    2: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", // ACCEPTED
    3: "bg-rose-500/10 text-rose-400 border-rose-500/30", // REJECTED
    4: "bg-slate-700/30 text-slate-400 border-slate-600/30", // WITHDRAWN
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {label}
    </span>
  );
}
