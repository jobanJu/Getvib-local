import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getUserChats } from "@/features/messages/server";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const chats = await getUserChats(user.id);
    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
