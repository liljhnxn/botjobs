"use client";

import React from "react";
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { TxLifecycleState } from "../lib/useBotJobs";
import { getExplorerTxUrl } from "../config/network";

interface TransactionStatusBannerProps {
  state: TxLifecycleState;
  txHash?: `0x${string}`;
  errorMessage?: string | null;
  onReset?: () => void;
  successMessage?: string;
}

export function TransactionStatusBanner({
  state,
  txHash,
  errorMessage,
  onReset,
  successMessage = "Transaction confirmed on Botchain.",
}: TransactionStatusBannerProps) {
  if (state === "idle") return null;

  return (
    <div className="rounded-xl border p-4 my-4 transition-all bg-[#11151F] border-[#232B3E]">
      {state === "wallet_confirmation" && (
        <div className="flex items-center gap-3 text-amber-400">
          <Wallet className="w-5 h-5 animate-pulse shrink-0" />
          <div>
            <p className="font-medium text-sm">Waiting for wallet confirmation...</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Please review and approve the transaction in your connected Web3 wallet.
            </p>
          </div>
        </div>
      )}

      {(state === "submitted" || state === "confirming") && (
        <div className="flex items-center justify-between gap-3 text-cyan-400">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            <div>
              <p className="font-medium text-sm">
                {state === "submitted"
                  ? "Transaction submitted to Botchain..."
                  : "Confirming transaction on-chain..."}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Waiting for block inclusion and receipt verification.
              </p>
            </div>
          </div>
          {txHash && (
            <a
              href={getExplorerTxUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline shrink-0"
            >
              View Tx <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-400">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-medium text-sm">{successMessage}</p>
              {txHash && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {txHash && (
              <a
                href={getExplorerTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors"
              >
                Explorer <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Transaction Failed</p>
              <p className="text-xs text-rose-300/90 mt-0.5">
                {errorMessage || "Transaction reverted or was rejected."}
              </p>
            </div>
          </div>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="self-end sm:self-center px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 hover:bg-rose-500/20"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
