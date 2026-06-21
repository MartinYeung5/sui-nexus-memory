import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongo";
import { Memory } from "@/lib/db/models";
import { embedText, cosineSim } from "@/lib/embedding/embed";
import { walrusGet, decrypt, sha256 } from "@/lib/walrus/client";
import { withJsonErrorHandling, requireEnv } from "@/lib/api-helpers";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().min(1),
  agentId: z.string().optional(),
  namespace: z.string().optional(),
  topK: z.number().int().min(1).max(50).default(5),
  threshold: z.number().min(0).max(1).default(0.2),
  decrypt: z.boolean().default(true)
});

export const POST = withJsonErrorHandling(async (req: NextRequest) => {
  requireEnv("MONGODB_URI", "OPENAI_API_KEY");
  await connectDB();
  const parsed = SearchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { query, agentId, namespace, topK, threshold, decrypt: doDecrypt } = parsed.data;

  const filter: any = {};
  if (agentId) filter.agentId = agentId;
  if (namespace) filter.namespace = namespace;

  const qvec = await embedText(query);
  const candidates = await Memory.find(filter).limit(2000).lean();

  const scored = candidates
    .map((m: any) => ({ m, score: cosineSim(qvec, m.embedding || []) }))
    .filter((x) => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const results = await Promise.all(
    scored.map(async ({ m, score }) => {
      let content: string | null = null;
      let integrityOk = false;
      if (doDecrypt) {
        try {
          const blob = await walrusGet(m.blobId);
          const plain = decrypt(blob).toString("utf-8");
          integrityOk = sha256(plain) === m.contentHash;
          content = plain;
        } catch (e) {
          console.warn("decrypt failed", e);
        }
      }
      return {
        id: m._id,
        score,
        blobId: m.blobId,
        version: m.version,
        metadata: m.metadata,
        content,
        integrityOk,
        createdAt: m.createdAt
      };
    })
  );

  return NextResponse.json({ ok: true, results });
});
