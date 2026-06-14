import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { decideVerification } from "@/features/admin/server";

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const { requestId, approve } = (await request.json()) as { requestId?: string; approve?: boolean };
    if (!requestId) return NextResponse.json({ error: "requestId manquant." }, { status: 400 });
    await decideVerification(requestId, !!approve);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Erreur." }, { status: 400 });
  }
}
