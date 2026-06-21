import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongo";
import { AuditLog } from "@/lib/db/models";
import { withJsonErrorHandling } from "@/lib/api-helpers";

export const GET = withJsonErrorHandling(async (req: NextRequest) => {
  await connectDB();
  const actor = req.nextUrl.searchParams.get("actor");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 200);
  const logs = await AuditLog.find(actor ? { actor } : {})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return NextResponse.json({ ok: true, logs });
});
