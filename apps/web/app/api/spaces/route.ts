import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongo";
import { SharedSpace } from "@/lib/db/models";
import { withJsonErrorHandling } from "@/lib/api-helpers";
import { z } from "zod";

const CreateSpaceSchema = z.object({
  name: z.string().min(1),
  owner: z.string(),
  members: z
    .array(
      z.object({
        agentId: z.string(),
        role: z.enum(["reader", "writer", "admin"])
      })
    )
    .default([])
});

export const POST = withJsonErrorHandling(async (req: NextRequest) => {
  await connectDB();
  const parsed = CreateSpaceSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const namespace = `space_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const space = await SharedSpace.create({ ...parsed.data, namespace });
  return NextResponse.json({ ok: true, space }, { status: 201 });
});

export const GET = withJsonErrorHandling(async (req: NextRequest) => {
  await connectDB();
  const owner = req.nextUrl.searchParams.get("owner");
  const spaces = await SharedSpace.find(owner ? { owner } : {}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, spaces });
});
