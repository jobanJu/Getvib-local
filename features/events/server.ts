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
    status: input.status || "published",
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

  const { data: userProfile } = await supabase.from("profiles").select("name").eq("id", userId).single();
  await createNotification(
    event.host_id, 
    "application_received", 
    `${userProfile?.name || "Quelqu'un"} souhaite rejoindre ta vibe.`,
    `/event/${eventId}/manage`
  );
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

  const { data: eventData } = await supabase.from("events").select("title").eq("id", eventId).single();

  if (status === "accepted") {
    await supabase.from("event_participants").insert({ event_id: eventId, user_id: userId });
    await ensureGroupChat(eventId, userId);
  }

  await createNotification(
    userId,
    status === "accepted" ? "application_accepted" : "application_rejected",
    status === "accepted" 
        ? `Ton hôte a accepté ta demande pour "${eventData?.title}".` 
        : `Ta candidature pour "${eventData?.title}" n'a pas été retenue.`,
    `/event/${eventId}`
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
      sender:sender_id (id, name, pseudo, photo_url, city),
      receiver:receiver_id (id, name, pseudo, photo_url, city)
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
    const { data: link, error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", requestId).select("sender_id, receiver_id").single();
    if (error) throw error;

    // Notification pour l'expéditeur initial
    const { data: receiver } = await supabase.from("profiles").select("name, pseudo").eq("id", link.receiver_id).single();
    await supabase.from("notifications").insert({
      user_id: link.sender_id,
      type: "application_accepted",
      title: `${receiver?.name || "Ton ami"} a accepté ta demande.`,
      link: `/u/${receiver?.pseudo}`
    });
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

async function createNotification(userId: string, type: string, title: string, link?: string) {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({ user_id: userId, type, title, link });
}

function defaultImageFor(vibe: string) {
  const query = encodeURIComponent(`${vibe} private dinner people evening`);
  return `https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=70&getvib=${query}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recherche d'amis par pseudo (@handle) + envoi de demande d'ami.
// ─────────────────────────────────────────────────────────────────────────────

/** Le pseudo est-il libre ? (insensible à la casse) Optionnellement on ignore
 *  le profil `exceptUserId` (utile quand on modifie son propre pseudo). */
export async function isPseudoAvailable(pseudo: string, exceptUserId?: string) {
  const supabase = createAdminClient();
  let query = supabase.from("profiles").select("id").ilike("pseudo", pseudo).limit(1);
  if (exceptUserId) query = query.neq("id", exceptUserId);
  const { data, error } = await query;
  if (error) throw error;
  return (data?.length ?? 0) === 0;
}

export type UserSearchResult = {
  id: string;
  name: string | null;
  pseudo: string | null;
  photo_url: string | null;
  city: string | null;
  /** Relation avec l'utilisateur courant */
  status: "none" | "friends" | "sent" | "received";
};

/** Recherche d'utilisateurs par pseudo OU nom, en excluant soi-même. Renvoie le
 *  statut d'amitié pour piloter le bouton (Ajouter / En attente / Amis). */
export async function searchUsers(currentUserId: string, rawQuery: string): Promise<UserSearchResult[]> {
  const q = rawQuery.trim().replace(/^@+/, "");
  if (q.length < 2) return [];

  const supabase = createAdminClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, pseudo, photo_url, city")
    .or(`pseudo.ilike.%${q}%,name.ilike.%${q}%`)
    .neq("id", currentUserId)
    .limit(15);
  if (error) throw error;
  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const { data: links } = await supabase
    .from("friendships")
    .select("sender_id, receiver_id, status")
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .in("sender_id", [currentUserId, ...ids])
    .in("receiver_id", [currentUserId, ...ids]);

  function statusFor(otherId: string): UserSearchResult["status"] {
    const link = links?.find(
      (l) =>
        (l.sender_id === currentUserId && l.receiver_id === otherId) ||
        (l.sender_id === otherId && l.receiver_id === currentUserId),
    );
    if (!link) return "none";
    if (link.status === "accepted") return "friends";
    return link.sender_id === currentUserId ? "sent" : "received";
  }

  return profiles.map((p) => ({ ...p, status: statusFor(p.id) }));
}

/** Envoie une demande d'ami (statut pending). Idempotent / défensif : refuse
 *  l'auto-ajout et les doublons (dans un sens comme dans l'autre). */
export async function sendFriendRequest(senderId: string, receiverId: string) {
  if (senderId === receiverId) throw new Error("Tu ne peux pas t'ajouter toi-même.");

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`,
    )
    .maybeSingle();

  if (existing) {
    if (existing.status === "accepted") throw new Error("Vous êtes déjà amis.");
    throw new Error("Une demande est déjà en attente.");
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ sender_id: senderId, receiver_id: receiverId, status: "pending" });
  if (error) throw error;

  // Notification pour le destinataire
  const { data: sender } = await supabase.from("profiles").select("name").eq("id", senderId).single();
  await supabase.from("notifications").insert({
    user_id: receiverId,
    type: "friend_request",
    title: `${sender?.name || "Quelqu'un"} t'a envoyé une demande d'ami.`,
    link: "/amis"
  });

  return { ok: true };
}

export type FriendVibe = {
  eventId: string;
  title: string;
  image: string;
  vibe: string;
  type: string;
  city: string;
  date: string;
  /** Amis qui participent (ou organisent) cette vibe */
  friendsGoing: { id: string; name: string | null; photo_url: string | null; isHost: boolean }[];
};

/** Vibes à venir où au moins un ami est hôte ou participant. Cœur de la page
 *  /amis : « où sortent mes amis ». */
export async function listFriendsVibes(userId: string): Promise<FriendVibe[]> {
  const supabase = createAdminClient();

  // 1. Mes amis (acceptés) + leurs infos d'affichage.
  const { data: links } = await supabase
    .from("friendships")
    .select("sender_id, receiver_id, sender:sender_id (id, name, photo_url), receiver:receiver_id (id, name, photo_url)")
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

  const friends = new Map<string, { id: string; name: string | null; photo_url: string | null }>();
  for (const l of links || []) {
    const f: any = (l as any).sender_id === userId ? (l as any).receiver : (l as any).sender;
    if (f?.id) friends.set(f.id, { id: f.id, name: f.name, photo_url: f.photo_url });
  }
  if (friends.size === 0) return [];

  // 2. Vibes publiées à venir avec leurs participants.
  const now = new Date().toISOString();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, image, vibe, type, city, date, host_id, event_participants(user_id)")
    .eq("status", "published")
    .gte("date", now)
    .order("date", { ascending: true })
    .limit(80);

  const out: FriendVibe[] = [];
  for (const e of events || []) {
    const goingIds = new Set<string>([
      ...(friends.has((e as any).host_id) ? [(e as any).host_id] : []),
      ...((e as any).event_participants || [])
        .map((p: any) => p.user_id)
        .filter((id: string) => friends.has(id)),
    ]);
    if (goingIds.size === 0) continue;

    out.push({
      eventId: (e as any).id,
      title: (e as any).title,
      image: (e as any).image,
      vibe: (e as any).vibe,
      type: (e as any).type,
      city: (e as any).city,
      date: (e as any).date,
      friendsGoing: [...goingIds].map((id) => ({
        ...friends.get(id)!,
        isHost: id === (e as any).host_id,
      })),
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Avis de soirées passées (ressentis).
// ─────────────────────────────────────────────────────────────────────────────

export type EventReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: string; name: string | null; pseudo: string | null; photo_url: string | null };
};

/** L'utilisateur a-t-il le droit de laisser un avis ? (vibe passée + il y était
 *  hôte ou participant + pas déjà d'avis). Renvoie { can, reason }. */
export async function canReviewEvent(userId: string, eventId: string) {
  const supabase = createAdminClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, host_id, date, event_participants(user_id)")
    .eq("id", eventId)
    .single();
  if (!event) return { can: false, reason: "introuvable" as const };

  const isPast = new Date((event as any).date).getTime() < Date.now();
  if (!isPast) return { can: false, reason: "pas_encore" as const };

  const attended =
    (event as any).host_id === userId ||
    ((event as any).event_participants || []).some((p: any) => p.user_id === userId);
  if (!attended) return { can: false, reason: "non_participant" as const };

  const { data: existing } = await supabase
    .from("event_reviews")
    .select("id")
    .eq("event_id", eventId)
    .eq("author_id", userId)
    .maybeSingle();
  if (existing) return { can: false, reason: "deja_donne" as const };

  return { can: true, reason: "ok" as const };
}

export async function createReview(userId: string, eventId: string, rating: number, comment: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Note invalide (1 à 5).");
  const trimmed = (comment || "").trim().slice(0, 1000);

  const { can, reason } = await canReviewEvent(userId, eventId);
  if (!can) {
    const messages: Record<string, string> = {
      introuvable: "Vibe introuvable.",
      pas_encore: "Tu pourras laisser un avis une fois la vibe passée.",
      non_participant: "Seuls les participants peuvent laisser un avis.",
      deja_donne: "Tu as déjà laissé un avis pour cette vibe.",
    };
    throw new Error(messages[reason] || "Avis impossible.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("event_reviews")
    .insert({ event_id: eventId, author_id: userId, rating, comment: trimmed || null });
  if (error) throw error;
  return { ok: true };
}

export async function listEventReviews(eventId: string): Promise<EventReview[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("event_reviews")
    .select("id, rating, comment, created_at, author:author_id (id, name, pseudo, photo_url)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    author: r.author,
  }));
}

export function reviewStats(reviews: { rating: number }[]) {
  if (reviews.length === 0) return { count: 0, average: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { count: reviews.length, average: Math.round((sum / reviews.length) * 10) / 10 };
}

/** Derniers avis laissés par mes amis (pour la page /amis). */
export async function listRecentFriendsReviews(userId: string, limit = 8) {
  const supabase = createAdminClient();
  const { data: links } = await supabase
    .from("friendships")
    .select("sender_id, receiver_id")
    .eq("status", "accepted")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  const friendIds = (links || []).map((l: any) => (l.sender_id === userId ? l.receiver_id : l.sender_id));
  if (friendIds.length === 0) return [];

  const { data } = await supabase
    .from("event_reviews")
    .select("id, rating, comment, created_at, author:author_id (id, name, pseudo, photo_url), event:event_id (id, title)")
    .in("author_id", friendIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || []).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    author: r.author,
    event: r.event,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Profil public (accessible via /u/@pseudo).
// ─────────────────────────────────────────────────────────────────────────────

/** Profil public d'un membre + stats pour les badges + relation avec le viewer. */
export async function getPublicProfile(pseudo: string, viewerId?: string) {
  const supabase = createAdminClient();
  const clean = pseudo.trim().replace(/^@+/, "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, pseudo, photo_url, bio, city, interests, verification_level, created_at")
    .ilike("pseudo", clean)
    .maybeSingle();
  if (!profile) return null;

  const [hosted, friends, attending, past] = await Promise.all([
    listEventsByHost(profile.id),
    listFriends(profile.id),
    listEventsAttending(profile.id),
    listPastEventsAttending(profile.id),
  ]);

  // Amis communs
  let commonFriends: any[] = [];
  if (viewerId && viewerId !== profile.id) {
    const viewerFriends = await listFriends(viewerId);
    commonFriends = friends.filter(f1 => viewerFriends.some(f2 => f1.id === f2.id));
  }

  const stats = {
    verificationLevel: profile.verification_level ?? 0,
    eventsHosted: hosted.length,
    vibPlusHosted: hosted.filter((e) => e.type === "vibplus").length,
    totalGuests: hosted.reduce((sum, e) => sum + e.participants.length, 0),
    eventsAttended: attending.length + past.length,
    friends: friends.length,
  };

  // Relation d'amitié avec le visiteur (pour le bouton Ajouter / Amis).
  let status: "none" | "friends" | "sent" | "received" | "self" = "none";
  if (viewerId && viewerId === profile.id) {
    status = "self";
  } else if (viewerId) {
    const { data: link } = await supabase
      .from("friendships")
      .select("sender_id, status")
      .or(
        `and(sender_id.eq.${viewerId},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${viewerId})`,
      )
      .maybeSingle();
    if (link) status = link.status === "accepted" ? "friends" : link.sender_id === viewerId ? "sent" : "received";
  }

  return { 
    profile, 
    stats, 
    friendsCount: friends.length, 
    hostedCount: hosted.length, 
    status,
    commonFriends,
    hostedEvents: hosted.slice(0, 3) // On renvoie les 3 derniers organisés
  };
}
