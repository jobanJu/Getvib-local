import { NextResponse } from "next/server";
import { deleteEvent, getEventForViewer } from "@/features/events/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const viewer = user;

  const { id } = await params;
  const event = await getEventForViewer(id, viewer?.id);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { id } = await params;
    const result = await deleteEvent(id, user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message.startsWith("Forbidden") ? 403 : message === "Event not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
