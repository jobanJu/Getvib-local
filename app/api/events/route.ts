import { NextResponse } from "next/server";
import { requireUser } from "@/lib/firebase/auth";
import { parseCreateEventInput } from "@/lib/validation";
import { createEvent, listPublishedEvents } from "@/features/events/server";

export async function GET() {
  try {
    const events = await listPublishedEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const input = parseCreateEventInput(await request.json());
    const event = await createEvent(user.uid, input);
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: 400 });
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}
