import { Timestamp } from "firebase-admin/firestore";

export function eventDateFromParts(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export function revealDateFor(eventDate: Date) {
  return new Date(eventDate.getTime() - 2 * 60 * 60 * 1000);
}

export function toAdminTimestamp(date: Date) {
  return Timestamp.fromDate(date);
}

export function isRevealDue(revealAt: FirebaseFirestore.Timestamp | Date) {
  const revealDate = revealAt instanceof Date ? revealAt : revealAt.toDate();
  return revealDate.getTime() <= Date.now();
}
