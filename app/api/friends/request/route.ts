import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { sendFriendRequest } from "@/features/events/server";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { targetId } = (await request.json()) as { targetId?: string };
    if (!targetId) return NextResponse.json({ error: "Cible manquante." }, { status: 400 });

    await sendFriendRequest(user.id, targetId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Demande impossible." }, { status: 400 });
  }
}
