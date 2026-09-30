"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useSwitchChain,
} from "wagmi";
import {
  Briefcase,
  PlusCircle,
  User,
  LayoutDashboard,
  Code2,
  Menu,
  X,
  Wallet,
  LogOut,
  AlertTriangle,
  ShieldCheck,
  History,
  FileText,
} from "lucide-react";
import { BOTCHAIN_CHAIN_ID, BOTCHAIN_NATIVE_SYMBOL } from "../config/network";
import { formatBotAmount, shortenAddress } from "../lib/format";
import { useBotNSResolution } from "../lib/useBotJobs";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const { data: balanceData } = useBalance({
    address,
    chainId: BOTCHAIN_CHAIN_ID,
  });

  const { botName } = useBotNSResolution(address);
  const isWrongNetwork = isConnected && chainId !== BOTCHAIN_CHAIN_ID;

  const navItems = [
    { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
    { href: "/jobs/create", label: "Post a Job", icon: PlusCircle },
    { href: "/applications", label: "Applications", icon: FileText },
    { href: "/work", label: "Active Work", icon: ShieldCheck },
    { href: "/history", label: "Work History", icon: History },
    { href: "/dashboard/client", label: "Client Hub", icon: LayoutDashboard },
    { href: "/dashboard/freelancer", label: "Freelancer Hub", icon: User },
    { href: "/developer", label: "Developers", icon: Code2 },
  ];

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#232B3E] bg-[#090B10]/90 backdrop-blur-md">
      {isWrongNetwork && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Connected to unsupported network (Chain ID {chainId}). BotJobs requires Botchain / Bohr Testnet (Chain ID 968).
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchChain({ chainId: BOTCHAIN_CHAIN_ID })}
            className="px-3 py-1 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors shrink-0"
          >
            Switch to Botchain
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg group-hover:bg-emerald-500/25 transition-colors">
              B
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-lg">
                Bot<span className="text-emerald-400">Jobs</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#161B28] text-slate-400 border border-[#232B3E]">
                Bohr 968
              </span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:text-white hover:bg-[#161B28]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11151F] border border-[#232B3E] text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300 font-mono">
                  {balanceData ? formatBotAmount(balanceData.value) : "0"}{" "}
                  {BOTCHAIN_NATIVE_SYMBOL}
                </span>
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B28] border border-[#232B3E] hover:border-emerald-500/40 text-xs font-mono text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{botName || shortenAddress(address)}</span>
              </Link>

              <button
                type="button"
                onClick={() => disconnect()}
                title="Disconnect Wallet"
                className="p-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg bg-[#161B28] border border-[#232B3E] text-slate-300"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#232B3E] bg-[#090B10] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-300 hover:bg-[#161B28]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-[#161B28]"
          >
            <User className="w-4 h-4" />
            My Freelancer Profile
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-[#161B28]"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin & Config
          </Link>
        </div>
      )}
    </header>
  );
}
