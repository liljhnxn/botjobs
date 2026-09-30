"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  ShieldCheck,
  Award,
  Globe,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { CONTRACT_CONFIG } from "../lib/contracts";
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_RPC_URL,
} from "../config/network";
import { ContractNotConfiguredBanner } from "../components/ContractNotConfiguredBanner";

export default function LandingPage() {
  return (
    <div className="space-y-20 py-4">
      <ContractNotConfiguredBanner />

      {/* HERO SECTION */}
      <section className="relative rounded-2xl bg-[#11151F] border border-[#232B3E] p-8 sm:p-14 overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Built for Botchain / Bohr Testnet (Chain ID {BOTCHAIN_CHAIN_ID})
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Find work. Build reputation. Get paid on-chain.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            BotJobs connects clients and Web3 talent through transparent, blockchain-powered hiring.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/jobs"
              id="hero-browse-jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Link>
            <Link
              href="/jobs/create"
              id="hero-post-job"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#161B28] hover:bg-[#1F2637] border border-[#232B3E] text-white font-semibold text-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">How It Works</h2>
          <p className="text-sm text-slate-400">
            End-to-end decentralized hiring lifecycle powered by BotJobs smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              step: "01",
              title: "Post On-Chain Job",
              desc: "Clients define job specifications, BOT budgets, categories, and deadlines directly on Botchain.",
            },
            {
              step: "02",
              title: "Submit Proposals",
              desc: "Freelancers create on-chain profiles and submit structured proposals with proposed BOT budgets and timelines.",
            },
            {
              step: "03",
              title: "Hire & Confirm Agreement",
              desc: "Clients review and accept an applicant. The selected freelancer confirms the hire on-chain to begin active work.",
            },
            {
              step: "04",
              title: "Settle via BotEscrow & Complete",
              desc: "Payment custody is managed by BotEscrow. Upon completion, work is permanently recorded in on-chain history.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3"
            >
              <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                STEP {item.step}
              </span>
              <h3 className="text-base font-semibold text-white pt-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR CLIENTS & FOR FREELANCERS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#11151F] border border-[#232B3E] p-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" /> For Clients
          </div>
          <h2 className="text-xl font-bold text-white">
            Hire Verified Web3 Builders Without Intermediaries
          </h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Create jobs with transparent BOT budgets and deadlines</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Shortlist, reject, or accept proposals with strict access control</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Automatic timeout protection if a selected freelancer fails to confirm</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Delegate payment custody and milestone releases to BotEscrow</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link
              href="/dashboard/client"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Open Client Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-[#11151F] border border-[#232B3E] p-8 space-y-5">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" /> For Freelancers
          </div>
          <h2 className="text-xl font-bold text-white">
            Own Your On-Chain Profile & Verifiable Work History
          </h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Create a sovereign on-chain talent profile with skills and BOT rates</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Submit proposals directly from your wallet with zero platform lock-in</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Confirm hiring agreements before work transitions to active status</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Build tamper-proof work history derived directly from completed jobs</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Configure Freelancer Profile <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* MODULAR INTEGRATIONS: BOTESCROW, BOTREPUTE, BOTNS */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Botchain Ecosystem Integrations
          </h2>
          <p className="text-sm text-slate-400">
            BotJobs is architected as a modular layer within the broader Botchain protocol stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BotEscrow */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                BotEscrow Integration
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                BotJobs never custodies job funds directly. Payment custody, milestones, releases, refunds, and dispute resolution are handled by BotEscrow.
              </p>
            </div>
            <div className="pt-3 border-t border-[#232B3E] text-xs font-mono">
              {CONTRACT_CONFIG.botEscrowAddress ? (
                <span className="text-emerald-400">
                  Configured: {CONTRACT_CONFIG.botEscrowAddress.slice(0, 10)}...
                </span>
              ) : (
                <span className="text-amber-400">
                  BotEscrow contract not configured.
                </span>
              )}
            </div>
          </div>

          {/* BotRepute */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                BotRepute Integration
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reads verifiable on-chain credentials (Developer, Builder, Project Contributor) without fabricating synthetic reputation scores.
              </p>
            </div>
            <div className="pt-3 border-t border-[#232B3E] text-xs font-mono">
              {CONTRACT_CONFIG.botReputeAddress ? (
                <span className="text-emerald-400">
                  Configured: {CONTRACT_CONFIG.botReputeAddress.slice(0, 10)}...
                </span>
              ) : (
                <span className="text-slate-400">
                  BotRepute credentials unavailable.
                </span>
              )}
            </div>
          </div>

          {/* BotNS */}
          <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                BotNS Identity
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resolves wallet addresses to human-readable <code className="text-slate-300">.bot</code> names when BotNS is connected, falling back cleanly to verified hex addresses.
              </p>
            </div>
            <div className="pt-3 border-t border-[#232B3E] text-xs font-mono">
              {CONTRACT_CONFIG.botNSAddress ? (
                <span className="text-emerald-400">
                  Configured: {CONTRACT_CONFIG.botNSAddress.slice(0, 10)}...
                </span>
              ) : (
                <span className="text-slate-400">
                  BotNS resolution unavailable.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BOTCHAIN ECOSYSTEM & SECURITY */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-semibold text-base">
            <Layers className="w-5 h-5 text-emerald-400" />
            Botchain Modular Ecosystem
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            BotJobs operates alongside specialized Botchain protocols so each contract maintains a focused security boundary:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { name: "BotNS", role: "On-chain Identity" },
              { name: "BotJobs", role: "Job Marketplace" },
              { name: "BotRepute", role: "Verified Credentials" },
              { name: "BotEscrow", role: "Work/Payment Escrow" },
              { name: "BotPay", role: "Payment Infrastructure" },
              { name: "BotDAO / BotInsure", role: "Governance & Protection" },
            ].map((mod) => (
              <div
                key={mod.name}
                className="p-3 rounded-lg bg-[#161B28] border border-[#232B3E]"
              >
                <div className="font-semibold text-white">{mod.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{mod.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-white font-semibold text-base">
            <Lock className="w-5 h-5 text-emerald-400" />
            Security Architecture
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Non-Custodial Marketplace:</strong> BotJobs rejects direct native token transfers (<code className="font-mono">PaymentCustodyNotAllowed</code>) so funds are never trapped in the marketplace contract.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Strict State Machine:</strong> Prevents unauthorized application edits, double hiring, or unilateral cancellation of active work without BotEscrow settlement.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Bounded On-Chain Storage:</strong> Enforces strict byte length limits on titles, descriptions, proposals, skills, and metadata URIs.
              </span>
            </li>
          </ul>
          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
            <span>RPC: {BOTCHAIN_RPC_URL}</span>
            <span>Explorer: {BOTCHAIN_EXPLORER_URL}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
