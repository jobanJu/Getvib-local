import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { decideFriendRequest } from "@/features/events/server";

export async function POST(request: Request) {
  const { response } = await requireUser();
  if (response) return response;

  try {
    const { requestId, status } = await request.json();
    if (!requestId || !status) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    await decideFriendRequest(requestId, status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
