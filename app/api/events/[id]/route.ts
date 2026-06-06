import { NextResponse } from "next/server";
import { getEventForViewer } from "@/features/events/server";
import { getAdminAuth } from "@/lib/firebase/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const viewer = token ? await getAdminAuth().verifyIdToken(token).catch(() => null) : null;
  const { id } = await params;
  const event = await getEventForViewer(id, viewer?.uid);

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}
