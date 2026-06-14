import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id: eventId } = await params;
  const { userId } = await request.json();

  if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const supabase = createAdminClient();

    // 1. Verify user is host
    const { data: event } = await supabase
      .from("events")
      .select("host_id")
      .eq("id", eventId)
      .single();

    if (!event || event.host_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Remove participant
    const { error: partErr } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (partErr) throw partErr;

    // 3. Remove/Update application to 'rejected' to allow them to re-apply if they want
    // or just delete it. Deleting is cleaner for "removing from event".
    await supabase
      .from("applications")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove participant" },
      { status: 500 }
    );
  }
}
