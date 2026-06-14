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
  
  // Une fois les messages listés, on marque comme lu
  await markChatAsRead(chatId, userId);

  return data.map(row => ({
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    text: row.text,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  }));
}

export async function getUserChats(userId: string) {
  const supabase = createAdminClient();
  
  // 1. Récupérer les participations
  const { data: participations, error: partError } = await supabase
    .from("chat_participants")
    .select("chat_id, last_read_at")
    .eq("user_id", userId);

  if (partError || !participations) return [];

  const chatIds = participations.map(p => p.chat_id);
  if (chatIds.length === 0) return [];

  // 2. Récupérer les détails des chats et les messages récents
  const { data: chats, error: chatsError } = await supabase
    .from("chats")
    .select(`
      id,
      type,
      event_id,
      created_at,
      updated_at,
      event:event_id (title),
      messages (text, created_at, sender_id)
    `)
    .in("id", chatIds)
    .order("updated_at", { ascending: false });

  if (chatsError || !chats) return [];

  // 3. Récupérer les participants
  const { data: allParticipants } = await supabase
    .from("chat_participants")
    .select(`
      chat_id,
      user:user_id (id, name, pseudo, photo_url)
    `)
    .in("chat_id", chatIds);

  // 4. Mapper
  return chats.map(chat => {
    const participants = allParticipants
      ?.filter(cp => cp.chat_id === chat.id)
      .map(cp => cp.user)
      .filter(Boolean) || [];
    
    const p = participations.find(p => p.chat_id === chat.id);
    const lastReadAt = p?.last_read_at || new Date(0).toISOString();

    // Calculer les non-lus localement
    const unreadCount = (chat.messages || []).filter(
      (m: any) => m.sender_id !== userId && new Date(m.created_at) > new Date(lastReadAt)
    ).length;

    let title = (chat as any).event?.title || "Discussion";
    if (chat.type === "private") {
      const other = participants.find((p: any) => p.id !== userId);
      if (other) title = (other as any).name;
    }

    const sortedMessages = (chat.messages || []).sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sortedMessages[0] || null;

    return {
      id: chat.id,
      eventId: chat.event_id,
      type: chat.type,
      title,
      participants,
      unreadCount,
      lastMessage: lastMessage ? {
        text: lastMessage.text,
        createdAt: lastMessage.created_at
      } : null,
      createdAt: chat.created_at,
      updatedAt: chat.updated_at,
    };
  });
}

export async function sendMessage(chatId: string, senderId: string, rawText: unknown, photoUrl?: string) {
  const text = photoUrl ? String(rawText || "") : parseString(rawText, "Message", 1200);
  const chat = await assertChatMember(chatId, senderId);
  const supabase = createAdminClient();
  
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      text,
      photo_url: photoUrl || null
    })
    .select()
    .single();

  if (error) throw error;

  // On marque comme lu pour l'expéditeur
  await markChatAsRead(chatId, senderId);

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
    photoUrl: message.photo_url,
    createdAt: message.created_at,
  };
}

export async function markChatAsRead(chatId: string, userId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("chat_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .eq("user_id", userId);
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
