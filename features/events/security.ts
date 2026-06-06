import { getAdminDb } from "@/lib/firebase/admin";

export async function assertEventHost(eventId: string, userId: string) {
  const eventDoc = await getAdminDb().collection("events").doc(eventId).get();
  if (!eventDoc.exists) throw new Error("Event not found.");
  if (eventDoc.data()?.hostId !== userId) throw new Error("Forbidden.");
}
