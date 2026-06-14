import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { createAccessRequest } from "@/features/admin/server";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const { reportId } = (await request.json()) as { reportId?: string };
    if (!reportId) return NextResponse.json({ error: "reportId manquant." }, { status: 400 });
    const res = await createAccessRequest(reportId);
    return NextResponse.json(res);
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Erreur." }, { status: 400 });
  }
}
