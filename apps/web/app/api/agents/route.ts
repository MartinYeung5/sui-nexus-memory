import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongo";
import { Agent, AuditLog } from "@/lib/db/models";
import { registerAgentOnchain } from "@/lib/sui/client";
import { withJsonErrorHandling } from "@/lib/api-helpers";
import { z } from "zod";

const CreateAgentSchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  modelProvider: z.enum(["openai", "anthropic", "google", "custom"]),
  modelName: z.string()
});

export const POST = withJsonErrorHandling(async (req: NextRequest) => {
  await connectDB();
  const parsed = CreateAgentSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const body = parsed.data;
  const namespace = `ns_${body.owner.slice(2, 10)}_${Date.now()}`;

  let onchainId: string | undefined;
  let txDigest: string | undefined;
  try {
    const r = await registerAgentOnchain(body.owner, body.name, namespace);
    onchainId = r.onchainId;
    txDigest = r.txDigest;
  } catch (e) {
    console.warn("Sui register skipped:", (e as Error).message);
  }

  const agent = await Agent.create({ ...body, namespace, onchainId });
  await AuditLog.create({
    actor: body.owner,
    agentId: agent._id,
    action: "agent.create",
    target: agent._id.toString(),
    txDigest
  });

  return NextResponse.json({ ok: true, agent, txDigest }, { status: 201 });
});

export const GET = withJsonErrorHandling(async (req: NextRequest) => {
  await connectDB();
  const owner = req.nextUrl.searchParams.get("owner");
  const agents = await Agent.find(owner ? { owner } : {}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, agents });
});
