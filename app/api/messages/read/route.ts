import { NextResponse } from "next/server";
import { markChatAsRead } from "@/features/messages/server";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { chatId } = await request.json();
    if (!chatId) throw new Error("chatId is required.");
    
    await markChatAsRead(chatId, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
