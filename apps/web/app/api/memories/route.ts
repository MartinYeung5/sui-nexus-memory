import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongo";
import { Agent, Memory, AuditLog } from "@/lib/db/models";
import { encrypt, walrusPut, sha256 } from "@/lib/walrus/client";
import { embedText } from "@/lib/embedding/embed";
import { logAuditOnchain } from "@/lib/sui/client";
import { withJsonErrorHandling, requireEnv } from "@/lib/api-helpers";
import { z } from "zod";

const CreateMemorySchema = z.object({
  agentId: z.string(),
  content: z.string().min(1),
  metadata: z.record(z.string(), z.any()).optional()
});

export const POST = withJsonErrorHandling(async (req: NextRequest) => {
  // Fail fast & explicit instead of crashing midway with an empty 500.
  requireEnv(
    "MONGODB_URI",
    "APP_ENCRYPTION_KEY",
    "WALRUS_PUBLISHER",
    "WALRUS_AGGREGATOR",
    "OPENAI_API_KEY"
  );

  await connectDB();
  const parsed = CreateMemorySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { agentId, content, metadata } = parsed.data;

  const agent = await Agent.findById(agentId);
  if (!agent) {
    return NextResponse.json(
      { ok: false, error: `agent ${agentId} not found` },
      { status: 404 }
    );
  }

  const { ciphertext } = encrypt(content);
  const { blobId, contentHash, integrityProof } = await walrusPut(ciphertext);
  const embedding = await embedText(content);

  let txDigest: string | undefined;
  try {
    txDigest = await logAuditOnchain("memory.create", sha256(content));
  } catch (e) {
    console.warn("Audit on-chain skipped:", (e as Error).message);
  }

  const mem = await Memory.create({
    agentId: agent._id,
    namespace: agent.namespace,
    blobId,
    contentHash,
    integrityProof,
    embedding,
    metadata,
    version: 1
  });
  await AuditLog.create({
    actor: agent.owner,
    agentId: agent._id,
    action: "memory.create",
    target: mem._id.toString(),
    txDigest
  });

  const obj = mem.toObject() as any;
  delete obj.embedding;
  return NextResponse.json({ ok: true, memory: obj, txDigest }, { status: 201 });
});

export const GET = withJsonErrorHandling(async (req: NextRequest) => {
  await connectDB();
  const agentId = req.nextUrl.searchParams.get("agentId");
  if (!agentId) {
    return NextResponse.json({ ok: false, error: "agentId required" }, { status: 400 });
  }
  const mems = await Memory.find({ agentId })
    .select("-embedding")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ ok: true, memories: mems });
});
