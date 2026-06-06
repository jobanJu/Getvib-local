import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { eventDateFromParts, isRevealDue, revealDateFor, toAdminTimestamp } from "@/lib/date";
import type { CreateEventInput, EventApplication, VibeEvent } from "@/lib/types";
import { parseString } from "@/lib/validation";

export async function listPublishedEvents() {
  const snapshot = await getAdminDb()
    .collection("events")
    .where("status", "==", "published")
    .orderBy("date", "asc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), address: undefined }));
}

export async function getEventForViewer(eventId: string, viewerId?: string) {
  const doc = await getAdminDb().collection("events").doc(eventId).get();
  if (!doc.exists) return null;

  const event = { id: doc.id, ...doc.data() } as VibeEvent;
  const isHost = viewerId === event.hostId;
  const isParticipant = Boolean(viewerId && event.participants.includes(viewerId));
  const revealDue = isRevealDue(event.revealAt as FirebaseFirestore.Timestamp);
  const canSeeAddress = isHost || (isParticipant && (event.addressVisible || revealDue));

  return {
    ...event,
    address: canSeeAddress ? event.address : "",
    addressVisible: canSeeAddress,
    publicLocation: event.city,
    addressHint: isParticipant ? "Adresse révélée 2h avant l&#39;événement" : event.city,
  };
}

export async function createEvent(hostId: string, input: CreateEventInput) {
  const db = getAdminDb();
  const eventDate = eventDateFromParts(input.date, input.time);
  const eventRef = db.collection("events").doc();
  const payload: Omit<VibeEvent, "id"> = {
    hostId,
    type: input.type,
    title: input.title,
    description: input.description,
    image: input.image || defaultImageFor(input.vibe),
    vibe: input.vibe,
    date: toAdminTimestamp(eventDate),
    city: input.city,
    address: input.address,
    addressVisible: false,
    revealAt: toAdminTimestamp(revealDateFor(eventDate)),
    maxParticipants: input.maxParticipants,
    participants: [],
    contributionAmount: input.contributionAmount,
    contributionReason: input.contributionReason,
    minAge: input.minAge,
    maxAge: input.maxAge,
    interestsRequired: input.interestsRequired,
    status: "published",
    createdAt: Timestamp.now(),
  };

  await eventRef.set(payload);
  await ensureGroupChat(eventRef.id, hostId);
  return { id: eventRef.id, ...payload };
}

export async function applyToEvent(eventId: string, userId: string, rawMessage: unknown) {
  const message = parseString(rawMessage, "Application message", 800);
  const db = getAdminDb();
  const eventRef = db.collection("events").doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) throw new Error("Event not found.");

  const existing = await db
    .collection("applications")
    .where("eventId", "==", eventId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  if (!existing.empty) throw new Error("Application already exists.");

  const applicationRef = db.collection("applications").doc();
  const application: Omit<EventApplication, "id"> = {
    eventId,
    userId,
    message,
    status: "pending",
    createdAt: Timestamp.now(),
  };

  await applicationRef.set(application);
  const event = eventDoc.data() as VibeEvent;
  await createNotification(event.hostId, "application_received", "Nouvelle candidature");
  await ensurePrivateChat(eventId, event.hostId, userId);
  return { id: applicationRef.id, ...application };
}

export async function decideApplication(eventId: string, userId: string, status: "accepted" | "rejected") {
  const db = getAdminDb();
  const applicationSnapshot = await db
    .collection("applications")
    .where("eventId", "==", eventId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (applicationSnapshot.empty) throw new Error("Application not found.");

  const applicationRef = applicationSnapshot.docs[0].ref;
  const eventRef = db.collection("events").doc(eventId);

  await db.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (!eventDoc.exists) throw new Error("Event not found.");
    const event = eventDoc.data() as VibeEvent;

    if (status === "accepted" && event.participants.length >= event.maxParticipants) {
      throw new Error("Event is full.");
    }

    transaction.update(applicationRef, { status });
    if (status === "accepted") {
      transaction.update(eventRef, { participants: FieldValue.arrayUnion(userId) });
    }
  });

  await createNotification(
    userId,
    status === "accepted" ? "application_accepted" : "application_rejected",
    status === "accepted" ? "Candidature acceptée" : "Candidature refusée",
  );

  return { ok: true };
}

export async function revealEventAddress(eventId: string) {
  const eventRef = getAdminDb().collection("events").doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) throw new Error("Event not found.");

  const event = eventDoc.data() as VibeEvent;
  if (!isRevealDue(event.revealAt as FirebaseFirestore.Timestamp)) {
    throw new Error("Address reveal is not due yet.");
  }

  await eventRef.update({ addressVisible: true });
  await Promise.all(event.participants.map((uid) => createNotification(uid, "address_revealed", "Adresse révélée")));
  return { ok: true };
}

export async function revealDueAddresses() {
  const now = Timestamp.now();
  const snapshot = await getAdminDb()
    .collection("events")
    .where("status", "==", "published")
    .where("addressVisible", "==", false)
    .where("revealAt", "<=", now)
    .limit(50)
    .get();

  await Promise.all(snapshot.docs.map((doc) => revealEventAddress(doc.id)));
  return { revealed: snapshot.size };
}

async function ensureGroupChat(eventId: string, hostId: string) {
  await getAdminDb().collection("chats").doc(`group_${eventId}`).set(
    {
      eventId,
      type: "group",
      participantIds: [hostId],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
}

async function ensurePrivateChat(eventId: string, hostId: string, userId: string) {
  await getAdminDb().collection("chats").doc(`private_${eventId}_${userId}`).set(
    {
      eventId,
      type: "private",
      participantIds: [hostId, userId],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
}

async function createNotification(userId: string, type: string, title: string) {
  await getAdminDb().collection("notifications").add({
    userId,
    type,
    title,
    read: false,
    createdAt: Timestamp.now(),
  });
}

function defaultImageFor(vibe: string) {
  const query = encodeURIComponent(`${vibe} private dinner people evening`);
  return `https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=80&getvib=${query}`;
}
