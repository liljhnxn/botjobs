"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { parseEther } from "viem";
import {
  Search,
  Filter,
  PlusCircle,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAllJobs, OnChainJob } from "../../lib/useBotJobs";
import {
  JOB_CATEGORIES,
  decodeCategoryBytes32,
  CONTRACT_CONFIG,
} from "../../lib/contracts";
import { isDeadlineExpired } from "../../lib/format";
import { JobCard } from "../../components/JobCard";
import { ContractNotConfiguredBanner } from "../../components/ContractNotConfiguredBanner";

export default function BrowseJobsPage() {
  const { data: rawJobs, isLoading, error, refetch } = useAllJobs();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [activeDeadlineOnly, setActiveDeadlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filteredJobs = useMemo(() => {
    const list = ((rawJobs as OnChainJob[] | undefined) || []).slice();

    return list
      .filter((job) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inTitle = job.title.toLowerCase().includes(q);
          const inDesc = job.description.toLowerCase().includes(q);
          if (!inTitle && !inDesc) return false;
        }

        if (selectedCategory !== "ALL") {
          const cat = decodeCategoryBytes32(job.category);
          if (cat !== selectedCategory) return false;
        }

        if (selectedStatus !== "ALL") {
          if (job.status !== Number(selectedStatus)) return false;
        }

        if (minBudget.trim() && !isNaN(Number(minBudget))) {
          try {
            const minWei = parseEther(minBudget.trim());
            if (job.budget < minWei) return false;
          } catch {
            // ignore invalid input
          }
        }

        if (maxBudget.trim() && !isNaN(Number(maxBudget))) {
          try {
            const maxWei = parseEther(maxBudget.trim());
            if (job.budget > maxWei) return false;
          } catch {
            // ignore invalid input
          }
        }

        if (activeDeadlineOnly && isDeadlineExpired(job.applicationDeadline)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return Number(b.createdAt - a.createdAt);
        }
        return Number(a.createdAt - b.createdAt);
      });
  }, [
    rawJobs,
    searchQuery,
    selectedCategory,
    selectedStatus,
    minBudget,
    maxBudget,
    activeDeadlineOnly,
    sortBy,
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Marketplace Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse real on-chain job listings retrieved directly from Botchain state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link
            href="/jobs/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post a Job
          </Link>
        </div>
      </div>

      <ContractNotConfiguredBanner />

      {/* SEARCH & FILTER BAR */}
      <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="job-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title or description..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <select
              id="job-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="job-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="0">OPEN</option>
              <option value="1">IN REVIEW</option>
              <option value="2">HIRED</option>
              <option value="3">IN PROGRESS</option>
              <option value="4">COMPLETED</option>
              <option value="5">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#232B3E]/60 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              id="min-budget-input"
              type="number"
              min="0"
              step="any"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="Min BOT"
              className="w-full px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <input
              id="max-budget-input"
              type="number"
              min="0"
              step="any"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="Max BOT"
              className="w-full px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                id="active-deadline-checkbox"
                type="checkbox"
                checked={activeDeadlineOnly}
                onChange={(e) => setActiveDeadlineOnly(e.target.checked)}
                className="rounded border-[#232B3E] bg-[#161B28] text-emerald-500 focus:ring-0"
              />
              <span>Active deadlines only</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-slate-400">Sort:</span>
            <select
              id="job-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
              className="px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {!CONTRACT_CONFIG.botJobsAddress ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-medium text-slate-300">
            No jobs available yet.
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Configure a deployed BotJobs contract address to query live marketplace listings on Botchain.
          </p>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-3">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">
            Reading job listings from Botchain RPC...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-rose-300">
            Failed to load jobs from Botchain
          </p>
          <p className="text-xs text-slate-400">
            Please verify that the contract address is deployed on Chain ID 968 and RPC is reachable.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-xl bg-[#11151F] border border-[#232B3E] p-12 text-center space-y-4">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              No jobs available yet.
            </p>
            <p className="text-xs text-slate-400">
              Be the first client to create an on-chain job listing on BotJobs.
            </p>
          </div>
          <Link
            href="/jobs/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
          >
            <PlusCircle className="w-4 h-4" />
            Create First Job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard key={job.jobId.toString()} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
