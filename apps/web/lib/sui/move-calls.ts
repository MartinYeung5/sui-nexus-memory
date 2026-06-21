"use client";
import { Transaction } from "@mysten/sui/transactions";

const PKG = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || "";

/** Build a tx that registers an Agent owned by the connected wallet. */
export function buildRegisterAgentTx(name: string, namespace: string, owner: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::agent_identity::register`,
    arguments: [
      tx.pure.address(owner),
      tx.pure.string(name),
      tx.pure.string(namespace),
      tx.object("0x6"),
    ],
  });
  return tx;
}

/** Build a tx that creates a shared MemoryACL object on Sui. */
export function buildCreateMemoryAclTx(agentObjectId: string, blobId: string, contentHash: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::memory_acl::create`,
    arguments: [
      tx.pure.id(agentObjectId),
      tx.pure.string(blobId),
      tx.pure.string(contentHash),
    ],
  });
  return tx;
}

/** Build a tx that grants read access on a MemoryACL to another address. */
export function buildGrantReadTx(aclObjectId: string, reader: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::memory_acl::grant_read`,
    arguments: [tx.object(aclObjectId), tx.pure.address(reader)],
  });
  return tx;
}

/** Build a tx that bumps a MemoryACL version with a new content hash. */
export function buildBumpVersionTx(aclObjectId: string, newHash: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::memory_acl::bump_version`,
    arguments: [tx.object(aclObjectId), tx.pure.string(newHash)],
  });
  return tx;
}

/** Build a tx that creates a shared SharedSpace owned by sender. */
export function buildCreateSharedSpaceTx(name: string, namespace: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::shared_space::create`,
    arguments: [tx.pure.string(name), tx.pure.string(namespace)],
  });
  return tx;
}

/** Build a tx that adds a member to a SharedSpace. role: 0=reader 1=writer 2=admin */
export function buildAddMemberTx(spaceObjectId: string, who: string, role: number) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::shared_space::add_member`,
    arguments: [tx.object(spaceObjectId), tx.pure.address(who), tx.pure.u8(role)],
  });
  return tx;
}

/** Build a tx that registers an Artifact owned by sender. */
export function buildRegisterArtifactTx(name: string, blobId: string, contentHash: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::artifact::register`,
    arguments: [
      tx.pure.string(name),
      tx.pure.string(blobId),
      tx.pure.string(contentHash),
    ],
  });
  return tx;
}

/** Build a tx that emits an on-chain audit event. */
export function buildAuditTx(action: string, targetHash: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PKG}::audit_log::record`,
    arguments: [
      tx.pure.string(action),
      tx.pure.string(targetHash),
      tx.object("0x6"),
    ],
  });
  return tx;
}

/** Build a SUI coin transfer tx (basic wallet feature). */
export function buildTransferSuiTx(recipient: string, amountMist: bigint) {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);
  tx.transferObjects([coin], tx.pure.address(recipient));
  return tx;
}
