import { NextResponse } from "next/server";
import { getEventForViewer } from "@/features/events/server";
import { createClient } from "@/lib/supabase/server";

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
