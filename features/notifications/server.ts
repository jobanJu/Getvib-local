import { getAdminDb } from "@/lib/firebase/admin";

export async function listNotifications(userId: string) {
  const snapshot = await getAdminDb()
    .collection("notifications")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(60)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
