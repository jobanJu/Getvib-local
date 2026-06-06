import { NextResponse } from "next/server";
import { applyToEvent } from "@/features/events/server";
import { requireUser } from "@/lib/firebase/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const application = await applyToEvent(id, user.uid, body.message);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
