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
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("events")
    .select("*, event_participants(user_id)")
    .eq("status", "published")
    .gte("date", now)
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
    image: input.image || `https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=70&vibe=${encodeURIComponent(input.vibe)}`,
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

export async function listFriends(userId: string) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("friendships")
    .select(`
      sender_id,
      receiver_id,
      sender:sender_id (id, name, photo_url, city),
      receiver:receiver_id (id, name, photo_url, city)
    `)
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  if (error) throw error;

  return data.map((f: any) => {
    const friend = f.sender_id === userId ? f.receiver : f.sender;
    return friend;
  });
}

export async function listPendingFriendRequests(userId: string) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("friendships")
    .select(`
      id,
      sender_id,
      sender:sender_id (id, name, photo_url, city)
    `)
    .eq("receiver_id", userId)
    .eq("status", "pending");

  if (error) throw error;

  return data.map((f: any) => ({
    id: f.id,
    userId: f.sender_id,
    name: f.sender.name,
    photo_url: f.sender.photo_url,
    city: f.sender.city
  }));
}

export async function decideFriendRequest(requestId: string, status: "accepted" | "rejected") {
  const supabase = createAdminClient();

  if (status === "rejected") {
    const { error } = await supabase.from("friendships").delete().eq("id", requestId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", requestId);
    if (error) throw error;
  }

  return { ok: true };
}

export async function getEventManagementData(eventId: string, hostId: string) {
  const supabase = createAdminClient();

  // 1. Get event details
  const { data: event, error: evtErr } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("host_id", hostId)
    .single();

  if (evtErr || !event) throw new Error("Event not found or unauthorized.");

  // 2. Get accepted participants with profiles
  const { data: participants, error: partErr } = await supabase
    .from("event_participants")
    .select(`
      user_id,
      profiles:user_id (id, name, photo_url, city, verification_level)
    `)
    .eq("event_id", eventId);

  if (partErr) throw partErr;

  // 3. Get pending applications with profiles
  const { data: applications, error: appErr } = await supabase
    .from("applications")
    .select(`
      *,
      profiles:user_id (id, name, photo_url, city, verification_level)
    `)
    .eq("event_id", eventId)
    .eq("status", "pending");

  if (appErr) throw appErr;

  return {
    event: mapEventRow({ ...event, event_participants: participants }),
    participants: participants.map((p: any) => p.profiles),
    applications: applications.map((a: any) => ({ ...a, user: a.profiles }))
  };
}

export async function listEventsAttending(userId: string): Promise<VibeEvent[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("event_participants")
    .select(`
      event_id,
      events:event_id (*)
    `)
    .eq("user_id", userId)
    .gte("events.date", now);

  if (error || !data) return [];

  // Filter out null events (in case of RLS or deletion issues) and map
  return data
    .filter((item: any) => item.events)
    .map((item: any) => mapEventRow({
      ...item.events,
      event_participants: [{ user_id: userId }] // We know they are a participant
    }));
}

export async function listPastEventsAttending(userId: string): Promise<VibeEvent[]> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("event_participants")
    .select(`
      event_id,
      events:event_id (*)
    `)
    .eq("user_id", userId)
    .lt("events.date", now)
    .order("events.date", { ascending: false });

  if (error || !data) return [];

  return data
    .filter((item: any) => item.events)
    .map((item: any) => mapEventRow({
      ...item.events,
      event_participants: [{ user_id: userId }]
    }));
}

export async function leaveEvent(eventId: string, userId: string) {
  const supabase = createAdminClient();

  // Remove from participants
  const { error: partError } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (partError) throw partError;

  // Also remove/update application to avoid being "accepted" but not in participant list
  await supabase
    .from("applications")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  return { ok: true };
}

export async function listPendingApplicationsForHost(hostId: string) {
  const supabase = createAdminClient();
  
  // 1. Get host events
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .eq("host_id", hostId);
    
  if (!events || events.length === 0) return [];
  const eventIds = events.map(e => e.id);

  // 2. Get pending applications with profiles
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      profiles:user_id (id, name, photo_url, city, verification_level)
    `)
    .in("event_id", eventIds)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(app => ({
    ...app,
    eventTitle: events.find(e => e.id === app.event_id)?.title || "Soirée inconnue",
    user: app.profiles
  }));
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
