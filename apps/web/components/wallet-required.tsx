"use client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";

/**
 * Gate any UI that requires a connected Sui wallet.
 *
 *   <WalletRequired>
 *     <SomeOnchainAction />
 *   </WalletRequired>
 */
export default function WalletRequired({
  children,
  message = "This action requires a connected Sui wallet.",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const account = useCurrentAccount();
  if (account) return <>{children}</>;
  return (
    <div className="bg-paper/60 border border-wood/20 rounded-sm p-6 text-center">
      <div className="font-song text-lg text-ink mb-2">Wallet not connected</div>
      <p className="text-sm text-wood mb-4">{message}</p>
      <div className="inline-block nexus-connect">
        <ConnectButton connectText="Connect Sui Wallet" />
      </div>
    </div>
  );
}
