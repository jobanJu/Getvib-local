import { createAdminClient } from "@/lib/supabase/admin";
import { eventDateFromParts, isRevealDue, revealDateFor } from "@/lib/date";
import type { CreateEventInput, EventApplication, VibeEvent } from "@/lib/types";
import { parseString } from "@/lib/validation";

// Helper to map snake_case row to camelCase VibeEvent
function mapEventRow(row: any): VibeEvent {
  return {
    id: row.id,
    hostId: row.host_id,
    type: row.type,
    title: row.title,
    description: row.description,
    image: row.image,
    vibe: row.vibe,
    date: row.date,
    city: row.city,
    address: row.address,
    addressVisible: row.address_visible,
    revealAt: row.reveal_at,
    maxParticipants: row.max_participants,
    contributionAmount: row.contribution_amount,
    contributionReason: row.contribution_reason,
    minAge: row.min_age,
    maxAge: row.max_age,
    interestsRequired: row.interests_required || [],
    status: row.status,
    createdAt: row.created_at,
    participants: row.event_participants ? row.event_participants.map((p: any) => p.user_id) : [],
  };
}

export async function listPublishedEvents(): Promise<VibeEvent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_participants(user_id)")
    .eq("status", "published")
    .order("date", { ascending: true })
    .limit(50);

  if (error) throw error;

  return data.map((row) => {
    const event = mapEventRow(row);
    event.address = ""; // hide address in list
    return event;
  });
}

export async function getEventForViewer(eventId: string, viewerId?: string) {
  const supabase = createAdminClient();
  const { data: row, error } = await supabase
    .from("events")
    .select("*, event_participants(user_id)")
    .eq("id", eventId)
    .single();

  if (error || !row) return null;

  const event = mapEventRow(row);
  const isHost = viewerId === event.hostId;
  const isParticipant = Boolean(viewerId && event.participants.includes(viewerId));
  const revealDue = isRevealDue(event.revealAt);
  const canSeeAddress = isHost || (isParticipant && (event.addressVisible || revealDue));

  return {
    ...event,
    address: canSeeAddress ? event.address : "",
    addressVisible: canSeeAddress,
    publicLocation: event.city,
    addressHint: isParticipant ? "Adresse révélée 2h avant l'événement" : event.city,
  };
}

export async function createEvent(hostId: string, input: CreateEventInput) {
  const supabase = createAdminClient();
  const eventDate = eventDateFromParts(input.date, input.time);
  
  const payload = {
    host_id: hostId,
    type: input.type,
    title: input.title,
    description: input.description,
    image: input.image || defaultImageFor(input.vibe),
    vibe: input.vibe,
    date: eventDate.toISOString(),
    city: input.city,
    address: input.address,
    address_visible: false,
    reveal_at: revealDateFor(eventDate).toISOString(),
    max_participants: input.maxParticipants,
    contribution_amount: input.contributionAmount,
    contribution_reason: input.contributionReason,
    min_age: input.minAge,
    max_age: input.maxAge,
    interests_required: input.interestsRequired,
    status: "published",
  };

  const { data, error } = await supabase.from("events").insert(payload).select().single();
  if (error) throw error;

  await ensureGroupChat(data.id, hostId);
  return mapEventRow({ ...data, event_participants: [] });
}

export async function applyToEvent(eventId: string, userId: string, rawMessage: unknown) {
  const message = parseString(rawMessage, "Application message", 800);
  const supabase = createAdminClient();

  const { data: event, error: eventErr } = await supabase.from("events").select("host_id").eq("id", eventId).single();
  if (eventErr || !event) throw new Error("Event not found.");

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (existing) throw new Error("Application already exists.");

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      event_id: eventId,
      user_id: userId,
      message,
      status: "pending"
    })
    .select()
    .single();

  if (error) throw error;

  await createNotification(event.host_id, "application_received", "Nouvelle candidature");
  await ensurePrivateChat(eventId, event.host_id, userId);

  return {
    id: application.id,
    eventId: application.event_id,
    userId: application.user_id,
    message: application.message,
    status: application.status,
    createdAt: application.created_at,
  };
}

export async function decideApplication(eventId: string, userId: string, status: "accepted" | "rejected") {
  const supabase = createAdminClient();

  const { data: application, error: appErr } = await supabase
    .from("applications")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();

  if (appErr || !application) throw new Error("Application not found.");

  const { data: event, error: evtErr } = await supabase
    .from("events")
    .select("id, max_participants, event_participants(user_id)")
    .eq("id", eventId)
    .single();

  if (evtErr || !event) throw new Error("Event not found.");

  if (status === "accepted" && event.event_participants.length >= event.max_participants) {
    throw new Error("Event is full.");
  }

  // Update application status
  await supabase.from("applications").update({ status }).eq("id", application.id);

  if (status === "accepted") {
    await supabase.from("event_participants").insert({ event_id: eventId, user_id: userId });
  }

  await createNotification(
    userId,
    status === "accepted" ? "application_accepted" : "application_rejected",
    status === "accepted" ? "Candidature acceptée" : "Candidature refusée",
  );

  return { ok: true };
}

export async function revealEventAddress(eventId: string) {
  const supabase = createAdminClient();
  const { data: event, error: evtErr } = await supabase
    .from("events")
    .select("reveal_at, event_participants(user_id)")
    .eq("id", eventId)
    .single();

  if (evtErr || !event) throw new Error("Event not found.");

  if (!isRevealDue(event.reveal_at)) {
    throw new Error("Address reveal is not due yet.");
  }

  await supabase.from("events").update({ address_visible: true }).eq("id", eventId);

  const participants = event.event_participants.map((p: any) => p.user_id);
  await Promise.all(participants.map((uid: string) => createNotification(uid, "address_revealed", "Adresse révélée")));
  return { ok: true };
}

export async function revealDueAddresses() {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: events, error } = await supabase
    .from("events")
    .select("id")
    .eq("status", "published")
    .eq("address_visible", false)
    .lte("reveal_at", now)
    .limit(50);

  if (error || !events) return { revealed: 0 };

  await Promise.all(events.map((doc) => revealEventAddress(doc.id)));
  return { revealed: events.length };
}

export async function deleteEvent(eventId: string, userId: string) {
  const supabase = createAdminClient();

  const { data: event, error: evtErr } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", eventId)
    .single();

  if (evtErr || !event) throw new Error("Event not found.");
  if (event.host_id !== userId) throw new Error("Forbidden: You are not the host.");

  // Les applications, participants, chats et messages liés sont supprimés
  // automatiquement via les contraintes FK `on delete cascade`.
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;

  return { ok: true };
}

export async function listEventsByHost(hostId: string): Promise<VibeEvent[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_participants(user_id)")
    .eq("host_id", hostId)
    .order("date", { ascending: true });

  if (error || !data) return [];

  return data.map(mapEventRow);
}

async function ensureGroupChat(eventId: string, hostId: string) {
  const supabase = createAdminClient();
  
  // Create chat
  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ event_id: eventId, type: "group" })
    .select()
    .single();
    
  if (error || !chat) return;

  // Add host to participants
  await supabase.from("chat_participants").insert({ chat_id: chat.id, user_id: hostId });
}

async function ensurePrivateChat(eventId: string, hostId: string, userId: string) {
  const supabase = createAdminClient();
  
  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ event_id: eventId, type: "private" })
    .select()
    .single();
    
  if (error || !chat) return;

  await supabase.from("chat_participants").insert([
    { chat_id: chat.id, user_id: hostId },
    { chat_id: chat.id, user_id: userId }
  ]);
}

async function createNotification(userId: string, type: string, title: string) {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({ user_id: userId, type, title });
}

function defaultImageFor(vibe: string) {
  const query = encodeURIComponent(`${vibe} private dinner people evening`);
  return `https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=70&getvib=${query}`;
}
