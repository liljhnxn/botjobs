import { formatEther } from "viem";

export function shortenAddress(address?: string): string {
  if (!address || address.length < 10) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBotAmount(weiAmount?: bigint): string {
  if (weiAmount === undefined) return "0";
  const formatted = formatEther(weiAmount);
  const [whole, fraction] = formatted.split(".");
  if (!fraction || Number(fraction) === 0) {
    return Number(whole).toLocaleString();
  }
  return `${Number(whole).toLocaleString()}.${fraction.slice(0, 4).replace(/0+$/, "")}`;
}

export function formatTimestamp(unixSeconds?: bigint | number): string {
  if (!unixSeconds) return "N/A";
  const ms = Number(unixSeconds) * 1000;
  if (ms <= 0) return "N/A";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(unixSeconds?: bigint | number): string {
  if (!unixSeconds) return "N/A";
  const ms = Number(unixSeconds) * 1000;
  if (ms <= 0) return "N/A";
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isDeadlineExpired(deadlineSeconds?: bigint | number): boolean {
  if (!deadlineSeconds) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds > Number(deadlineSeconds);
}

export function parseContractError(err: unknown): string {
  if (!err) return "An unknown error occurred.";
  const msg = err instanceof Error ? err.message : String(err);

  if (msg.includes("User rejected") || msg.includes("User denied")) {
    return "Transaction rejected in wallet.";
  }
  if (msg.includes("insufficient funds")) {
    return "Insufficient BOT balance for gas fees.";
  }
  if (msg.includes("DeadlinePassed")) {
    return "The application deadline for this job has expired.";
  }
  if (msg.includes("DuplicateApplication")) {
    return "You have already submitted an application for this job.";
  }
  if (msg.includes("ClientCannotApplyToOwnJob")) {
    return "You cannot apply to a job that you created.";
  }
  if (msg.includes("UnauthorizedCaller")) {
    return "Unauthorized action: Your wallet does not have permission for this operation.";
  }
  if (msg.includes("InvalidJobStatus")) {
    return "This job is not in the valid status for this transition.";
  }
  if (msg.includes("InvalidApplicationStatus")) {
    return "This application is not in the valid status for this transition.";
  }
  if (msg.includes("ActiveJobCancellationRequiresEscrowSettlement")) {
    return "Active work cannot be unilaterally cancelled. Cancellation must be settled via BotEscrow first.";
  }
  if (msg.includes("EscrowNotSettledForCompletion")) {
    return "BotEscrow agreement must be released before marking this job completed.";
  }
  if (msg.includes("ProfileAlreadyExists")) {
    return "An on-chain profile already exists for this wallet. Use update profile instead.";
  }
  if (msg.includes("EnforcedPause")) {
    return "The BotJobs marketplace contract is currently paused.";
  }
  if (msg.includes("fetch") || msg.includes("HTTP request failed")) {
    return "RPC connection failed. Please verify https://rpc.botchain.ai is reachable.";
  }

  const shortMatch = msg.match(/Details:\s*(.+)/i) || msg.match(/reason:\s*(.+)/i);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1].slice(0, 180);
  }
  return msg.slice(0, 200);
}
