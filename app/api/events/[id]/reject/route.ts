import { NextResponse } from "next/server";
import { decideApplication } from "@/features/events/server";
import { requireUser } from "@/lib/auth";
import { assertEventHost } from "@/features/events/security";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { id } = await params;
    await assertEventHost(id, user.id);
    const body = await request.json();
    const result = await decideApplication(id, String(body.userId), "rejected");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
