"use client";
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { useState } from "react";

/**
 * Wallet connect button styled in the project's Neo-Chinese theme.
 * - When disconnected: shows the @mysten/dapp-kit ConnectButton (modal-based).
 * - When connected: shows the shortened address + a tiny disconnect chip.
 */
export default function WalletButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [copied, setCopied] = useState(false);

  if (!account) {
    return (
      <div className="nexus-connect">
        <ConnectButton connectText="Connect Wallet" />
      </div>
    );
  }

  const short = `${account.address.slice(0, 6)}…${account.address.slice(-4)}`;

  function copy() {
    navigator.clipboard.writeText(account!.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={copy}
        title={account.address}
        className="px-3 py-1 text-sm bg-wood text-rice rounded-sm hover:bg-ink font-mono"
      >
        {copied ? "✓ Copied" : short}
      </button>
      <button
        onClick={() => disconnect()}
        className="text-xs text-wood hover:text-cinnabar"
      >
        Disconnect
      </button>
    </div>
  );
}
