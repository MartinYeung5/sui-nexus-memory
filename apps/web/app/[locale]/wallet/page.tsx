"use client";
import { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { useLocale } from "next-intl";
import { FeatureBanner } from "@/components/feature-banner";
import { HelpTooltip } from "@/components/help-tooltip";
import WalletRequired from "@/components/wallet-required";
import {
  buildTransferSuiTx,
  buildAuditTx,
  buildCreateSharedSpaceTx,
  buildAddMemberTx,
  buildRegisterArtifactTx,
} from "@/lib/sui/move-calls";

function shorten(s: string, head = 8, tail = 6) {
  if (!s) return "";
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export default function WalletPage() {
  const locale = useLocale();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const [balance, setBalance] = useState<string>("—");
  const [ownedObjects, setOwnedObjects] = useState<any[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  // Forms
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("0.01");
  const [auditAction, setAuditAction] = useState("custom.action");
  const [auditHash, setAuditHash] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [memberSpaceId, setMemberSpaceId] = useState("");
  const [memberAddr, setMemberAddr] = useState("");
  const [memberRole, setMemberRole] = useState(1);
  const [artifactName, setArtifactName] = useState("");
  const [artifactBlob, setArtifactBlob] = useState("");
  const [artifactHash, setArtifactHash] = useState("");

  async function refresh() {
    if (!account) return;
    try {
      const bal = await suiClient.getBalance({ owner: account.address });
      setBalance((Number(bal.totalBalance) / 1e9).toFixed(4));
    } catch {
      setBalance("?");
    }
    try {
      const objs = await suiClient.getOwnedObjects({
        owner: account.address,
        options: { showType: true, showContent: false },
        limit: 50,
      });
      setOwnedObjects(objs.data || []);
    } catch {}
    try {
      const txs = await suiClient.queryTransactionBlocks({
        filter: { FromAddress: account.address },
        options: { showEffects: true, showInput: false },
        limit: 8,
        order: "descending",
      });
      setRecentTx(txs.data || []);
    } catch {}
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address]);

  async function runTx(buildFn: () => any, label: string) {
    setStatus(`Signing: ${label}…`);
    try {
      const tx = buildFn();
      const res = await signAndExecute({ transaction: tx });
      setStatus(`✓ ${label} — digest: ${shorten(res.digest)}`);
      setTimeout(refresh, 1500);
    } catch (e: any) {
      setStatus(`✗ ${label}: ${e?.message ?? e}`);
    }
  }

  return (
    <div>
      <FeatureBanner
        title="Sui Wallet"
        summary="Connect your Sui wallet to perform all on-chain operations directly from your browser — transfer SUI, register agents/artifacts, manage shared spaces, and emit audit events."
        steps={[
          "Click 'Connect Wallet' in the top right (Sui, Suiet, Phantom, etc.).",
          "Your address, SUI balance, and owned NexusMemory objects appear below.",
          "Use the action panels to send signed transactions to Sui directly.",
        ]}
        guideHref={`/${locale}/help`}
      />

      <WalletRequired message="Connect any Sui-compatible wallet (Sui Wallet, Suiet, Phantom, OKX, Nightly, Backpack…) to use this page.">
        {/* Wallet summary */}
        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-paper/70 border border-wood/20 rounded-sm p-5">
            <div className="text-sm text-wood">Address</div>
            <div className="font-mono text-ink mt-2 break-all text-sm">
              {account?.address}
            </div>
          </div>
          <div className="bg-paper/70 border border-wood/20 rounded-sm p-5">
            <div className="text-sm text-wood">SUI Balance</div>
            <div className="font-song text-3xl text-cinnabar mt-2">{balance}</div>
            <div className="text-xs text-wood/70">SUI on testnet</div>
          </div>
          <div className="bg-paper/70 border border-wood/20 rounded-sm p-5">
            <div className="text-sm text-wood flex items-center">
              Owned Objects
              <HelpTooltip text="All Sui objects you own, including NexusMemory Agents, MemoryACLs, SharedSpaces and Artifacts. Useful for getting object IDs." />
            </div>
            <div className="font-song text-3xl text-cinnabar mt-2">
              {ownedObjects.length}
            </div>
            <button
              onClick={refresh}
              className="text-xs text-cinnabar hover:underline mt-1"
            >
              Refresh
            </button>
          </div>
        </section>

        {status && (
          <div className="bg-rice border-l-4 border-cinnabar p-3 rounded-sm font-mono text-xs mb-6 break-all">
            {status}
          </div>
        )}

        {/* Action panels */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* 1) Transfer SUI */}
          <ActionPanel
            title="Transfer SUI"
            tip="A plain Sui coin transfer. Amount is in SUI; converted to MIST (1 SUI = 1e9 MIST) on submit."
          >
            <input
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="Recipient 0x..."
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <input
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Amount (SUI)"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <button
              disabled={!transferTo || isPending}
              onClick={() =>
                runTx(
                  () =>
                    buildTransferSuiTx(
                      transferTo,
                      BigInt(Math.floor(Number(transferAmount) * 1e9))
                    ),
                  "Transfer SUI"
                )
              }
              className="px-4 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
            >
              Sign &amp; Send
            </button>
          </ActionPanel>

          {/* 2) Emit on-chain audit */}
          <ActionPanel
            title="Emit Audit Event"
            tip="Calls audit_log::record(action, target_hash). Useful for anchoring off-chain workflow steps with on-chain evidence."
          >
            <input
              value={auditAction}
              onChange={(e) => setAuditAction(e.target.value)}
              placeholder="action (e.g. memory.read)"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <input
              value={auditHash}
              onChange={(e) => setAuditHash(e.target.value)}
              placeholder="target hash (sha256 hex)"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <button
              disabled={!auditAction || !auditHash || isPending}
              onClick={() => runTx(() => buildAuditTx(auditAction, auditHash), "Audit event")}
              className="px-4 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
            >
              Sign &amp; Emit
            </button>
          </ActionPanel>

          {/* 3) Create SharedSpace on-chain */}
          <ActionPanel
            title="Create Shared Space (on-chain)"
            tip="Calls shared_space::create. Produces a shared SharedSpace object whose admin is the connected wallet."
          >
            <input
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="space name"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <button
              disabled={!spaceName || isPending}
              onClick={() => {
                const ns = `space_${Date.now()}_${Math.random()
                  .toString(36)
                  .slice(2, 6)}`;
                runTx(() => buildCreateSharedSpaceTx(spaceName, ns), "Create space");
              }}
              className="px-4 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
            >
              Sign &amp; Create
            </button>
          </ActionPanel>

          {/* 4) Add member */}
          <ActionPanel
            title="Add Member to Space"
            tip="Calls shared_space::add_member(space, who, role). role: 0=reader, 1=writer, 2=admin. Only the owner can call this."
          >
            <input
              value={memberSpaceId}
              onChange={(e) => setMemberSpaceId(e.target.value)}
              placeholder="SharedSpace object id"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <input
              value={memberAddr}
              onChange={(e) => setMemberAddr(e.target.value)}
              placeholder="member 0x..."
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(Number(e.target.value))}
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            >
              <option value={0}>reader (0)</option>
              <option value={1}>writer (1)</option>
              <option value={2}>admin (2)</option>
            </select>
            <button
              disabled={!memberSpaceId || !memberAddr || isPending}
              onClick={() =>
                runTx(
                  () => buildAddMemberTx(memberSpaceId, memberAddr, memberRole),
                  "Add member"
                )
              }
              className="px-4 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
            >
              Sign &amp; Add
            </button>
          </ActionPanel>

          {/* 5) Register Artifact */}
          <ActionPanel
            title="Register Artifact (on-chain ownership)"
            tip="Calls artifact::register. After running, you'll own an Artifact-like object on Sui that proves authorship of the Walrus blob."
          >
            <input
              value={artifactName}
              onChange={(e) => setArtifactName(e.target.value)}
              placeholder="artifact name"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <input
              value={artifactBlob}
              onChange={(e) => setArtifactBlob(e.target.value)}
              placeholder="Walrus blobId"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <input
              value={artifactHash}
              onChange={(e) => setArtifactHash(e.target.value)}
              placeholder="content sha256 hex"
              className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2"
            />
            <button
              disabled={!artifactName || !artifactBlob || !artifactHash || isPending}
              onClick={() =>
                runTx(
                  () => buildRegisterArtifactTx(artifactName, artifactBlob, artifactHash),
                  "Register artifact"
                )
              }
              className="px-4 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
            >
              Sign &amp; Register
            </button>
          </ActionPanel>

          {/* 6) Sign-in message (proof of ownership) */}
          <ActionPanel
            title="Sign Message (Proof of Ownership)"
            tip="Cryptographically signs a plaintext message with your wallet. Use it to prove that a given Sui address controls a session or a memory."
          >
            <SignMessageWidget />
          </ActionPanel>
        </section>

        {/* Owned objects */}
        <section className="mt-10">
          <h3 className="font-song text-xl text-ink mb-3 flex items-center">
            Your On-chain Objects
            <HelpTooltip text="Filtered list of objects owned by your wallet. Copy any object id to use in the action panels above." />
          </h3>
          <ul className="grid md:grid-cols-2 gap-3">
            {ownedObjects.slice(0, 30).map((o: any) => (
              <li
                key={o.data?.objectId}
                className="bg-rice border-l-4 border-cinnabar p-3 rounded-sm text-xs"
              >
                <div className="font-mono break-all text-ink">{o.data?.objectId}</div>
                <div className="text-wood/80 mt-1 break-all">{o.data?.type}</div>
              </li>
            ))}
            {ownedObjects.length === 0 && (
              <li className="text-sm text-wood/70 col-span-2">
                No objects yet. Use the action panels above to create some.
              </li>
            )}
          </ul>
        </section>

        {/* Recent transactions */}
        <section className="mt-10">
          <h3 className="font-song text-xl text-ink mb-3">Recent Transactions</h3>
          <ul className="space-y-2">
            {recentTx.map((tx: any) => (
              <li
                key={tx.digest}
                className="bg-rice border-l-4 border-cinnabar p-3 text-xs flex justify-between rounded-sm"
              >
                <a
                  href={`https://suiscan.xyz/testnet/tx/${tx.digest}`}
                  target="_blank"
                  className="font-mono text-cinnabar hover:underline break-all"
                >
                  {tx.digest}
                </a>
                <span className="text-wood/70 shrink-0 ml-3">
                  {tx.effects?.status?.status ?? ""}
                </span>
              </li>
            ))}
            {recentTx.length === 0 && (
              <li className="text-sm text-wood/70">No transactions yet.</li>
            )}
          </ul>
        </section>
      </WalletRequired>
    </div>
  );
}

function ActionPanel({
  title,
  tip,
  children,
}: {
  title: string;
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper/60 border border-wood/20 rounded-sm p-5">
      <div className="font-song text-lg text-ink mb-3 flex items-center">
        {title}
        <HelpTooltip text={tip} />
      </div>
      {children}
    </div>
  );
}

function SignMessageWidget() {
  const { mutateAsync: signMessage, isPending } = useSignPersonalMessage();
  const [msg, setMsg] = useState("I authorize this session at " + new Date().toISOString());
  const [sig, setSig] = useState<string>("");

  async function go() {
    setSig("");
    try {
      const res = await signMessage({ message: new TextEncoder().encode(msg) });
      setSig(res.signature);
    } catch (e: any) {
      setSig(`✗ ${e?.message ?? e}`);
    }
  }

  return (
    <>
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        rows={2}
        className="bg-rice border border-wood/30 rounded px-3 py-2 w-full mb-2 text-sm"
      />
      <button
        onClick={go}
        disabled={isPending || !msg}
        className="px-4 py-2 bg-cinnabar text-rice rounded-sm hover:bg-wood disabled:opacity-40"
      >
        {isPending ? "Signing…" : "Sign"}
      </button>
      {sig && (
        <div className="mt-3 text-[10px] font-mono break-all bg-rice border border-wood/20 rounded-sm p-2">
          {sig}
        </div>
      )}
    </>
  );
}
