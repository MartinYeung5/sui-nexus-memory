import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongo";
import { Artifact } from "@/lib/db/models";
import { walrusPut } from "@/lib/walrus/client";
import { withJsonErrorHandling, requireEnv } from "@/lib/api-helpers";

export const POST = withJsonErrorHandling(async (req: NextRequest) => {
  requireEnv("MONGODB_URI", "WALRUS_PUBLISHER");
  await connectDB();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const name = (form.get("name") as string) || file?.name || "artifact";
  const agentId = form.get("agentId") as string | null;
  const spaceId = (form.get("spaceId") as string) || undefined;

  if (!file) return NextResponse.json({ ok: false, error: "file required" }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const { blobId, contentHash, integrityProof } = await walrusPut(buf);

  const artifact = await Artifact.create({
    name,
    agentId: agentId || undefined,
    spaceId,
    blobId,
    contentHash,
    integrityProof,
    size: buf.length,
    mimeType: file.type,
    version: 1
  });
  return NextResponse.json({ ok: true, artifact }, { status: 201 });
});

export const GET = withJsonErrorHandling(async () => {
  await connectDB();
  const items = await Artifact.find().sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ ok: true, artifacts: items });
});
