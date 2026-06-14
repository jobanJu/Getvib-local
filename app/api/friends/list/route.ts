import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listFriends } from "@/features/events/server";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const friends = await listFriends(user.id);
    return NextResponse.json({ friends });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 });
  }
}
