export function eventDateFromParts(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

export function revealDateFor(eventDate: Date) {
  return new Date(eventDate.getTime() - 2 * 60 * 60 * 1000);
}

export function isRevealDue(revealAt: { toDate: () => Date } | Date | string | number) {
  const isFirestoreTimestamp = revealAt && typeof revealAt === 'object' && 'toDate' in revealAt;
  const revealDate = isFirestoreTimestamp ? (revealAt as { toDate: () => Date }).toDate() : new Date(revealAt as Date | string | number);
  return revealDate.getTime() <= Date.now();
}

export function formatEventDate(date: { toDate: () => Date } | Date | string | number | null | undefined) {
  if (!date) return "";
  const isFirestoreTimestamp = typeof date === 'object' && 'toDate' in date;
  const d = isFirestoreTimestamp ? (date as { toDate: () => Date }).toDate() : new Date(date as Date | string | number);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(" à ", " · ");
}
