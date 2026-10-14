import React from "react";
import Link from "next/link";
import { ShieldAlert, ExternalLink } from "lucide-react";
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_MAIN_WEBSITE_URL,
  BOTCHAIN_RPC_URL,
} from "../config/network";
import { CONTRACT_CONFIG } from "../lib/contracts";
import { BotchainLogo } from "./BotchainLogo";

export function Footer() {
  return (
    <footer className="border-t border-[#232B3E] bg-[#090B10] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-black border border-emerald-500/40 flex items-center justify-center p-1.5 shadow-sm shadow-emerald-500/10">
                <BotchainLogo className="w-full h-full" />
              </div>
              <span className="font-bold text-white text-base">
                Bot<span className="text-emerald-400">Jobs</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Decentralized Web3 jobs and talent marketplace running natively on Botchain Mainnet. Connect directly with clients and builders through verifiable smart contracts.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span>Chain ID: {BOTCHAIN_CHAIN_ID}</span>
              <span>Token: BOT</span>
              <a
                href={BOTCHAIN_MAIN_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
              >
                <BotchainLogo className="w-3.5 h-3.5" />
                botchain.ai <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href={BOTCHAIN_EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline"
              >
                <BotchainLogo className="w-3.5 h-3.5" />
                scan.botchain.ai <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Navigation
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
              <li>
                <Link href="/developer" className="hover:text-white">
                  Developer Integration
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black border border-emerald-500/40 flex items-center justify-center p-1 shadow-sm shadow-emerald-500/10">
                <BotchainLogo className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  BOT Chain
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">Mainnet Chain ID 677</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              BotJobs is built natively on the BOT Chain ecosystem.
            </p>
            <div className="space-y-2 pt-1 border-t border-[#232B3E]/60 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">BOT Chain website:</span>
                <a
                  href={BOTCHAIN_MAIN_WEBSITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-mono text-xs break-all"
                >
                  <BotchainLogo className="w-3 h-3 shrink-0" />
                  https://botchain.ai
                  <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                </a>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">BOT Chain explorer:</span>
                <a
                  href={BOTCHAIN_EXPLORER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-mono text-xs break-all"
                >
                  <BotchainLogo className="w-3 h-3 shrink-0" />
                  https://scan.botchain.ai
                  <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                </a>
              </div>
            </div>
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
            {CONTRACT_CONFIG.botJobsAddress ? (
              <a
                href={`${BOTCHAIN_EXPLORER_URL}/address/${CONTRACT_CONFIG.botJobsAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                {CONTRACT_CONFIG.botJobsAddress}
              </a>
            ) : (
              "Not configured"
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
