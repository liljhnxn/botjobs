import React from "react";
import Link from "next/link";
import { ShieldAlert, ExternalLink } from "lucide-react";
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_RPC_URL,
} from "../config/network";
import { CONTRACT_CONFIG } from "../lib/contracts";

export function Footer() {
  return (
    <footer className="border-t border-[#232B3E] bg-[#090B10] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                B
              </div>
              <span className="font-bold text-white text-base">
                Bot<span className="text-emerald-400">Jobs</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Decentralized Web3 jobs and talent marketplace running natively on Botchain / Bohr Testnet. Connect directly with clients and builders through verifiable smart contracts.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span>Chain ID: {BOTCHAIN_CHAIN_ID}</span>
              <span>Token: BOT</span>
              <a
                href={BOTCHAIN_EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
              >
                scan.bohr.life <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Marketplace
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link href="/jobs" className="hover:text-white">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/jobs/create" className="hover:text-white">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white">
                  Freelancer Profile
                </Link>
              </li>
              <li>
                <Link href="/work" className="hover:text-white">
                  Active Work
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white">
                  On-Chain History
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Ecosystem & Docs
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link href="/dashboard/client" className="hover:text-white">
                  Client Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/freelancer" className="hover:text-white">
                  Freelancer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/developer" className="hover:text-white">
                  Developer Integration
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Contract Configuration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-200">Security Disclaimer</p>
              <p>
                BotJobs is experimental Web3 marketplace software. Smart contracts may contain vulnerabilities. Users should verify contract addresses before interacting. BotJobs does not custody payment funds in the marketplace contract—payment custody is delegated to BotEscrow when integrated. On-chain profiles are public, and metadata URIs may expose information publicly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-[#232B3E]/60 pt-6">
          <span>
            BotJobs Marketplace • RPC: {BOTCHAIN_RPC_URL}
          </span>
          <span className="font-mono">
            BotJobs Contract:{" "}
            {CONTRACT_CONFIG.botJobsAddress
              ? CONTRACT_CONFIG.botJobsAddress
              : "Not configured"}
          </span>
        </div>
      </div>
    </footer>
  );
}
