import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

export const sui = new SuiClient({ url: process.env.SUI_RPC_URL! });
const PACKAGE_ID = process.env.SUI_PACKAGE_ID!;

/** Load the admin keypair used for backend-signed transactions. */
export function adminKeypair(): Ed25519Keypair {
  const { secretKey } = decodeSuiPrivateKey(process.env.SUI_ADMIN_PRIVATE_KEY!);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

/** Register an agent identity on Sui. Returns its on-chain object id + tx digest. */
export async function registerAgentOnchain(owner: string, name: string, namespace: string) {
  const kp = adminKeypair();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::agent_identity::register`,
    arguments: [
      tx.pure.address(owner),
      tx.pure.string(name),
      tx.pure.string(namespace),
      tx.object("0x6") // shared Clock object
    ]
  });
  const res = await sui.signAndExecuteTransaction({
    transaction: tx,
    signer: kp,
    options: { showObjectChanges: true, showEffects: true }
  });
  const created = res.objectChanges?.find(
    (c: any) => c.type === "created" && c.objectType?.includes("agent_identity::Agent")
  ) as any;
  return { onchainId: created?.objectId as string, txDigest: res.digest };
}

/** Emit an on-chain audit event (action + target hash). */
export async function logAuditOnchain(action: string, targetHash: string) {
  const kp = adminKeypair();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::audit_log::record`,
    arguments: [tx.pure.string(action), tx.pure.string(targetHash), tx.object("0x6")]
  });
  const res = await sui.signAndExecuteTransaction({ transaction: tx, signer: kp });
  return res.digest;
}
