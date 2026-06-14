import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createReview } from "@/features/events/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { id } = await params;
    const { rating, comment } = (await request.json()) as { rating?: number; comment?: string };
    await createReview(user.id, id, Number(rating), comment || "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Avis impossible." }, { status: 400 });
  }
}
