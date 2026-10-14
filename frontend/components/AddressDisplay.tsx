"use client";

import React, { useState } from "react";
import { Address } from "viem";
import { ExternalLink, Copy, Check } from "lucide-react";
import { shortenAddress } from "../lib/format";
import { getExplorerAddressUrl } from "../config/network";
import { useBotNSResolution } from "../lib/useBotJobs";

interface AddressDisplayProps {
  address?: string | Address;
  showExplorerLink?: boolean;
  showCopy?: boolean;
  className?: string;
}

export function AddressDisplay({
  address,
  showExplorerLink = true,
  showCopy = true,
  className = "",
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);
  const validAddr =
    address && address !== "0x0000000000000000000000000000000000000000"
      ? (address as Address)
      : undefined;

  const { botName } = useBotNSResolution(validAddr);

  if (!validAddr) {
    return <span className="text-slate-500 font-mono text-xs">Unassigned</span>;
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(validAddr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      {botName ? (
        <span className="text-emerald-400 font-semibold">{botName}</span>
      ) : (
        <span className="text-slate-300">{shortenAddress(validAddr)}</span>
      )}

      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title="Copy address"
          className="text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}

      {showExplorerLink && (
        <a
          href={getExplorerAddressUrl(validAddr)}
          target="_blank"
          rel="noopener noreferrer"
          title="View on Botchain Explorer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </span>
  );
}
