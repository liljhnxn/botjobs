"use client";

import React from "react";
import {
  Code2,
  ShieldCheck,
  Award,
  Globe,
  ExternalLink,
  Layers,
  Terminal,
} from "lucide-react";
import { CONTRACT_CONFIG, BOTJOBS_ABI } from "../../lib/contracts";
import {
  BOTCHAIN_CHAIN_ID,
  BOTCHAIN_EXPLORER_URL,
  BOTCHAIN_MAIN_WEBSITE_URL,
  BOTCHAIN_RPC_URL,
  BOTCHAIN_NATIVE_SYMBOL,
} from "../../config/network";
import { AddressDisplay } from "../../components/AddressDisplay";
import { BotchainLogo } from "../../components/BotchainLogo";

export default function DeveloperPage() {
  const readFunctions = BOTJOBS_ABI.filter(
    (item) => item.type === "function" && item.stateMutability === "view"
  );
  const writeFunctions = BOTJOBS_ABI.filter(
    (item) => item.type === "function" && item.stateMutability !== "view"
  );

  const contractEvents = [
    "JobCreated(uint256 indexed jobId, address indexed client, string title, uint256 budget, uint256 applicationDeadline)",
    "JobCancelled(uint256 indexed jobId, address indexed cancelledBy, JobStatus previousStatus)",
    "ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed freelancer, uint256 proposedBudget, uint256 estimatedDays)",
    "ApplicationWithdrawn(uint256 indexed applicationId, uint256 indexed jobId, address indexed freelancer)",
    "ApplicationShortlisted(uint256 indexed applicationId, uint256 indexed jobId, address indexed freelancer)",
    "ApplicationRejected(uint256 indexed applicationId, uint256 indexed jobId, address indexed freelancer)",
    "FreelancerHired(uint256 indexed jobId, uint256 indexed applicationId, address indexed freelancer, address client)",
    "HireConfirmed(uint256 indexed jobId, address indexed freelancer, address indexed client)",
    "JobCompleted(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 budget, uint256 completedAt)",
    "ProfileCreated(address indexed freelancer, string displayName, uint256 hourlyRate)",
    "ProfileUpdated(address indexed freelancer, string displayName, uint256 hourlyRate)",
    "ProfileDeactivated(address indexed freelancer)",
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Code2 className="w-7 h-7 text-emerald-400" />
          Developer & Protocol Integration Documentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete technical reference for integrating with BotJobs, BotEscrow, BotRepute, and BotNS on Botchain.
        </p>
      </div>

      {/* NETWORK & DEPLOYED ADDRESSES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            Botchain Network Parameters
          </h2>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">Network</span>
              <span className="text-white">Botchain Mainnet</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">Chain ID</span>
              <span className="text-emerald-400 font-bold">
                {BOTCHAIN_CHAIN_ID}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">RPC Endpoint</span>
              <span className="text-slate-200">{BOTCHAIN_RPC_URL}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">BOT Chain website</span>
              <a
                href={BOTCHAIN_MAIN_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1.5"
              >
                <BotchainLogo className="w-3.5 h-3.5" />
                https://botchain.ai <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">BOT Chain explorer</span>
              <a
                href={BOTCHAIN_EXPLORER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1.5"
              >
                <BotchainLogo className="w-3.5 h-3.5" />
                https://scan.botchain.ai <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">Native Currency</span>
              <span className="text-white">{BOTCHAIN_NATIVE_SYMBOL}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            Configured Ecosystem Contracts
          </h2>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">BotJobs Marketplace</span>
              {CONTRACT_CONFIG.botJobsAddress ? (
                <AddressDisplay address={CONTRACT_CONFIG.botJobsAddress} />
              ) : (
                <span className="text-amber-400">Not configured</span>
              )}
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">BotEscrow</span>
              {CONTRACT_CONFIG.botEscrowAddress ? (
                <AddressDisplay address={CONTRACT_CONFIG.botEscrowAddress} />
              ) : (
                <span className="text-slate-400 text-xs">
                  Configurable via admin setEcosystemContracts()
                </span>
              )}
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">BotRepute</span>
              {CONTRACT_CONFIG.botReputeAddress ? (
                <AddressDisplay address={CONTRACT_CONFIG.botReputeAddress} />
              ) : (
                <span className="text-slate-400">
                  BotRepute credentials unavailable.
                </span>
              )}
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#161B28]">
              <span className="text-slate-400">BotNS</span>
              {CONTRACT_CONFIG.botNSAddress ? (
                <AddressDisplay address={CONTRACT_CONFIG.botNSAddress} />
              ) : (
                <span className="text-slate-400">
                  BotNS resolution unavailable.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ECOSYSTEM ARCHITECTURE & INTEGRATION FLOWS */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-6">
        <div className="flex items-center gap-2 text-base font-semibold text-white">
          <Layers className="w-5 h-5 text-emerald-400" />
          Botchain Modular Protocol Stack & Integration Flows
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> BotEscrow Flow
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
              <li>Client creates job on BotJobs</li>
              <li>Freelancer applies via applyForJob()</li>
              <li>Client accepts freelancer (OPEN → HIRED)</li>
              <li>Freelancer calls confirmHire() (HIRED → IN_PROGRESS)</li>
              <li>Client creates BotEscrow agreement &amp; locks BOT</li>
              <li>Milestones &amp; releases handled by BotEscrow</li>
              <li>Client calls markJobCompleted() on BotJobs</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-cyan-400">
              <Award className="w-4 h-4" /> BotRepute Credential Flow
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
              <li>Freelancer completes BotJobs work</li>
              <li>Client confirms completion on-chain</li>
              <li>BotJobs emits JobCompleted event</li>
              <li>
                Connected BotRepute module can issue{" "}
                <code className="text-cyan-300">PROJECT_CONTRIBUTOR</code> or{" "}
                <code className="text-cyan-300">BUILDER</code> credential
              </li>
              <li>Public profile queries IBotRepute.getCredentials()</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg bg-[#161B28] border border-[#232B3E] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-purple-400">
              <Globe className="w-4 h-4" /> BotNS Identity Flow
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
              <li>User connects Web3 wallet</li>
              <li>Frontend queries IBotNS.primaryName(address)</li>
              <li>If resolved, displays verified name (e.g., alice.bot)</li>
              <li>If unconfigured or unregistered, displays shortened hex</li>
              <li>Never fabricates synthetic .bot names</li>
            </ol>
          </div>
        </div>
      </div>

      {/* READ & WRITE FUNCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3">
          <h2 className="text-base font-semibold text-white">
            Read Functions ({readFunctions.length})
          </h2>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {readFunctions.map((fn) => (
              <div
                key={fn.name}
                className="p-2.5 rounded bg-[#161B28] border border-[#232B3E] font-mono text-xs text-emerald-300"
              >
                {fn.name}(
                {fn.inputs.map((i) => `${i.type} ${i.name}`).join(", ")})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-3">
          <h2 className="text-base font-semibold text-white">
            Write Functions ({writeFunctions.length})
          </h2>
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {writeFunctions.map((fn) => (
              <div
                key={fn.name}
                className="p-2.5 rounded bg-[#161B28] border border-[#232B3E] font-mono text-xs text-cyan-300"
              >
                {fn.name}(
                {fn.inputs.map((i) => `${i.type} ${i.name}`).join(", ")})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVENTS & ABI ACCESS */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-6 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Smart Contract Events & Indexing
        </h2>
        <p className="text-xs text-slate-400">
          BotJobs emits indexed events for every marketplace transition. For MVP, the frontend reads contract state directly; high-volume production deployments can index these events via The Graph or Covalent.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {contractEvents.map((ev) => (
            <div
              key={ev}
              className="p-2.5 rounded bg-[#161B28] border border-[#232B3E] font-mono text-[11px] text-slate-300 break-all"
            >
              event {ev}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
