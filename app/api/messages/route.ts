import { NextResponse } from "next/server";
import { listMessages, sendMessage } from "@/features/messages/server";
import { requireUser } from "@/lib/firebase/auth";

export async function GET(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const chatId = new URL(request.url).searchParams.get("chatId");
    if (!chatId) throw new Error("chatId is required.");
    const messages = await listMessages(chatId, user.uid);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body = await request.json();
    const message = await sendMessage(String(body.chatId), user.uid, body.text);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
