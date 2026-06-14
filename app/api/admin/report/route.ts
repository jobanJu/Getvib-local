import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { dismissReport } from "@/features/admin/server";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const { reportId } = (await request.json()) as { reportId?: string };
    if (!reportId) return NextResponse.json({ error: "reportId manquant." }, { status: 400 });
    await dismissReport(reportId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Erreur." }, { status: 400 });
  }
}
