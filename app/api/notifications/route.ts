import { NextResponse } from "next/server";
import { listNotifications } from "@/features/notifications/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const notifications = await listNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
