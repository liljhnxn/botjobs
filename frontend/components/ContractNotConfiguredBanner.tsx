"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Settings } from "lucide-react";
import { CONTRACT_CONFIG } from "../lib/contracts";

export function ContractNotConfiguredBanner() {
  if (CONTRACT_CONFIG.botJobsAddress) return null;

  return (
    <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-5 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-300">
              BotJobs Contract Address Not Configured
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No <code className="font-mono text-amber-200">NEXT_PUBLIC_BOTJOBS_ADDRESS</code> is currently set in your environment. Deploy <code className="font-mono">BotJobs.sol</code> to Botchain Mainnet (Chain ID 677) and add the deployed address to <code className="font-mono">.env.local</code>.
            </p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-medium text-amber-200 hover:bg-amber-500/30 shrink-0 self-start sm:self-center"
        >
          <Settings className="w-3.5 h-3.5" />
          View Config
        </Link>
      </div>
    </div>
  );
}
