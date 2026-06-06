import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { parseString } from "@/lib/validation";

export async function createReport(reporterId: string, body: Record<string, unknown>) {
  const targetUserId = parseString(body.targetUserId, "Target user", 120);
  const reason = parseString(body.reason, "Reason", 800);
  const ref = getAdminDb().collection("reports").doc();
  const payload = { reporterId, targetUserId, reason, createdAt: Timestamp.now() };
  await ref.set(payload);
  return { id: ref.id, ...payload };
}
