import { createAdminClient } from "@/lib/supabase/admin";
import { parseString } from "@/lib/validation";

export async function listMessages(chatId: string, userId: string) {
  await assertChatMember(chatId, userId);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;
  
  return data.map(row => ({
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    text: row.text,
    createdAt: row.created_at,
  }));
}

export async function getUserChats(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chats")
    .select("*, chat_participants!inner(user_id)")
    .eq("chat_participants.user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  // Need to fetch other participants to map to the `participantIds` array
  const chatIds = data.map(c => c.id);
  const { data: allParticipants } = await supabase
    .from("chat_participants")
    .select("chat_id, user_id")
    .in("chat_id", chatIds);

  return data.map(chat => {
    const participants = allParticipants?.filter(p => p.chat_id === chat.id).map(p => p.user_id) || [];
    return {
      id: chat.id,
      eventId: chat.event_id,
      type: chat.type,
      participantIds: participants,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
    };
  });
}

export async function sendMessage(chatId: string, senderId: string, rawText: unknown) {
  const text = parseString(rawText, "Message", 1200);
  const chat = await assertChatMember(chatId, senderId);
  const supabase = createAdminClient();
  
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      text,
    })
    .select()
    .single();

  if (error) throw error;

  // updatedAt is handled by the Postgres trigger `on_message_inserted`

  const recipients = chat.participantIds.filter((uid) => uid !== senderId);
  await Promise.all(
    recipients.map((uid) =>
      supabase.from("notifications").insert({
        user_id: uid,
        type: "new_message",
        title: "Nouveau message",
      })
    )
  );

  return {
    id: message.id,
    chatId: message.chat_id,
    senderId: message.sender_id,
    text: message.text,
    createdAt: message.created_at,
  };
}

async function assertChatMember(chatId: string, userId: string) {
  const supabase = createAdminClient();
  const { data: participants, error } = await supabase
    .from("chat_participants")
    .select("user_id")
    .eq("chat_id", chatId);

  if (error || !participants || participants.length === 0) {
    throw new Error("Chat not found or access forbidden.");
  }

  const pIds = participants.map(p => p.user_id);
  if (!pIds.includes(userId)) {
    throw new Error("Forbidden.");
  }

  return { participantIds: pIds };
}
