import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { leaveEvent } from "@/features/events/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id: eventId } = await params;

  try {
    await leaveEvent(eventId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to leave event" },
      { status: 500 }
    );
  }
}
