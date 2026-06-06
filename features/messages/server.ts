import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb, getAdminRealtimeDb } from "@/lib/firebase/admin";
import { parseString } from "@/lib/validation";

export async function listMessages(chatId: string, userId: string) {
  await assertChatMember(chatId, userId);
  const snapshot = await getAdminDb()
    .collection("messages")
    .where("chatId", "==", chatId)
    .orderBy("createdAt", "asc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function sendMessage(chatId: string, senderId: string, rawText: unknown) {
  const text = parseString(rawText, "Message", 1200);
  const chat = await assertChatMember(chatId, senderId);
  const messageRef = getAdminDb().collection("messages").doc();
  const payload = { chatId, senderId, text, createdAt: Timestamp.now() };

  await messageRef.set(payload);
  await getAdminDb().collection("chats").doc(chatId).update({ updatedAt: Timestamp.now() });
  await getAdminRealtimeDb().ref(`chats/${chatId}/messages/${messageRef.id}`).set({
    ...payload,
    createdAt: Date.now(),
  });

  const recipients = (chat.participantIds as string[]).filter((uid) => uid !== senderId);
  await Promise.all(
    recipients.map((userId) =>
      getAdminDb().collection("notifications").add({
        userId,
        type: "new_message",
        title: "Nouveau message",
        read: false,
        createdAt: Timestamp.now(),
      }),
    ),
  );

  return { id: messageRef.id, ...payload };
}

async function assertChatMember(chatId: string, userId: string) {
  const chatDoc = await getAdminDb().collection("chats").doc(chatId).get();
  if (!chatDoc.exists) throw new Error("Chat not found.");
  const chat = chatDoc.data() || {};
  if (!Array.isArray(chat.participantIds) || !chat.participantIds.includes(userId)) {
    throw new Error("Forbidden.");
  }
  return chat;
}
