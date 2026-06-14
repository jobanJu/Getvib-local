import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { searchUsers } from "@/features/events/server";

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const q = new URL(request.url).searchParams.get("q") || "";
    const results = await searchUsers(user.id, q);
    return NextResponse.json({ results });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Recherche impossible." }, { status: 400 });
  }
}
