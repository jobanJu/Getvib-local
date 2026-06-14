import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { friendId } = await request.json();
    if (!friendId) return NextResponse.json({ error: "Friend ID required" }, { status: 400 });

    const supabase = createAdminClient();

    // 1. Check if friendship exists
    const { data: friendship } = await supabase
      .from("friendships")
      .select("id")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`)
      .eq("status", "accepted")
      .single();

    if (!friendship) return NextResponse.json({ error: "Must be friends to chat" }, { status: 403 });

    // 2. Check if private chat already exists
    // We search for a chat of type 'private' where both users are participants
    const { data: existingChat } = await supabase
      .rpc('get_private_chat', { uid1: user.id, uid2: friendId });

    if (existingChat) {
      return NextResponse.json({ chat: existingChat });
    }

    // 3. Create new chat
    const { data: newChat, error: chatErr } = await supabase
      .from("chats")
      .insert({ type: "private" })
      .select()
      .single();

    if (chatErr) throw chatErr;

    // 4. Add participants
    await supabase.from("chat_participants").insert([
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: friendId }
    ]);

    // Get friend details for title
    const { data: friendProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", friendId)
      .single();

    return NextResponse.json({ 
      chat: { 
        ...newChat, 
        title: friendProfile?.name || "Discussion privée" 
      } 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
