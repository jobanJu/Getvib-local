import { createAdminClient } from "@/lib/supabase/admin";

// Supabase type les relations imbriquées comme des tableaux ; on normalise vers
// des objets simples via ces types (cast `as unknown as`).
type Person = { id: string; name: string | null; pseudo: string | null; email?: string | null };
export type AdminReport = { id: string; reason: string; created_at: string; reporter: Person | null; target: Person | null };
export type AdminVerification = { id: string; photo_url: string; status: string; created_at: string; user: Person | null };

// Toutes ces fonctions s'exécutent en SERVICE ROLE (bypass RLS) → réservées aux
// pages/routes déjà protégées par requireAdmin*. Elles donnent une vue globale
// pour la modération : signalements, vérifications, tickets, conversations.

export async function getAdminStats() {
  const supabase = createAdminClient();
  const counts = await Promise.all([
    supabase.from("reports").select("id", { count: "exact", head: true }),
    supabase.from("verification_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("chats").select("id", { count: "exact", head: true }),
  ]);
  return {
    reports: counts[0].count ?? 0,
    verifications: counts[1].count ?? 0,
    tickets: counts[2].count ?? 0,
    users: counts[3].count ?? 0,
    chats: counts[4].count ?? 0,
  };
}

export async function listReports() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("reports")
    .select("id, reason, created_at, reporter:reporter_id (id, name, pseudo, email), target:target_user_id (id, name, pseudo, email)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as AdminReport[];
}

export async function listPendingVerifications() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("verification_requests")
    .select("id, photo_url, status, created_at, user:user_id (id, name, pseudo, email)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as AdminVerification[];
}

export async function listSupportTickets() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("support_tickets")
    .select("id, subject, message, email, status, created_at, user:user_id (name, pseudo)")
    .order("created_at", { ascending: false })
    .limit(50);
  return data || [];
}

export async function listConversations() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("chats")
    .select("id, type, updated_at, chat_participants (user:user_id (id, name, pseudo)), messages (count)")
    .order("updated_at", { ascending: false })
    .limit(100);
  return (data || []).map((c: any) => ({
    id: c.id,
    type: c.type,
    updatedAt: c.updated_at,
    participants: (c.chat_participants || []).map((p: any) => p.user).filter(Boolean),
    messageCount: c.messages?.[0]?.count ?? 0,
  }));
}

export async function getConversation(chatId: string) {
  const supabase = createAdminClient();
  const [{ data: parts }, { data: messages }] = await Promise.all([
    supabase.from("chat_participants").select("user:user_id (id, name, pseudo)").eq("chat_id", chatId),
    supabase
      .from("messages")
      .select("id, text, created_at, sender:sender_id (id, name, pseudo)")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true }),
  ]);
  return {
    participants: (parts || []).map((p: any) => p.user).filter(Boolean),
    messages: (messages || []).map((m: any) => ({
      id: m.id,
      text: m.text,
      createdAt: m.created_at,
      sender: m.sender,
    })),
  };
}

export async function searchAdminProfiles(q: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("profiles")
    .select("id, name, pseudo, email, city, verification_level, is_premium, is_banned, banned_until, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const clean = q.trim();
  if (clean) query = query.or(`name.ilike.%${clean}%,pseudo.ilike.%${clean}%,email.ilike.%${clean}%`);
  const { data } = await query;
  return data || [];
}

// ─── Actions ───
export async function setUserBanStatus(userId: string, banned: boolean, until?: string | null) {
  const supabase = createAdminClient();
  const updates: any = { is_banned: banned };
  if (banned) {
    updates.banned_until = until || null; // null = permanent
  } else {
    updates.banned_until = null;
  }
  
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (error) throw error;
  
  return { ok: true };
}

export async function decideVerification(requestId: string, approve: boolean) {
  const supabase = createAdminClient();
  const { data: req } = await supabase.from("verification_requests").select("user_id").eq("id", requestId).single();
  if (!req) throw new Error("Demande introuvable.");
  if (approve) {
    await supabase.from("profiles").update({ verification_level: 1 }).eq("id", req.user_id);
    await supabase.from("verification_requests").update({ status: "approved" }).eq("id", requestId);
  } else {
    await supabase.from("verification_requests").update({ status: "rejected" }).eq("id", requestId);
  }
  return { ok: true };
}

export async function dismissReport(reportId: string) {
  const supabase = createAdminClient();
  await supabase.from("reports").delete().eq("id", reportId);
  return { ok: true };
}

// ─── Accès aux messages sur consentement ───

/** Crée une demande de consentement au SIGNALEUR pour voir sa conversation avec
 *  la personne visée. Idempotent : pas de doublon en attente. */
export async function createAccessRequest(reportId: string) {
  const supabase = createAdminClient();
  const { data: report } = await supabase
    .from("reports")
    .select("reporter_id, target_user_id")
    .eq("id", reportId)
    .single();
  if (!report) throw new Error("Signalement introuvable.");

  const { reporter_id, target_user_id } = report as { reporter_id: string; target_user_id: string };

  // Demande déjà en attente pour cette paire ?
  const { data: existing } = await supabase
    .from("message_access_grants")
    .select("id")
    .eq("reporter_id", reporter_id)
    .eq("reported_id", target_user_id)
    .eq("status", "pending")
    .maybeSingle();
  if (existing) return { ok: true, alreadyPending: true };

  // Nom de la personne visée (dénormalisé pour l'affichage côté signaleur).
  const { data: reported } = await supabase.from("profiles").select("name").eq("id", target_user_id).maybeSingle();
  // Conversation privée existante entre les deux (si elle existe).
  const { data: chat } = await supabase.rpc("get_private_chat", { uid1: reporter_id, uid2: target_user_id });
  const chatId = typeof chat === "string" ? chat : (chat as { id?: string } | null)?.id ?? null;

  const { error } = await supabase.from("message_access_grants").insert({
    reporter_id,
    reported_id: target_user_id,
    reported_name: (reported as { name?: string } | null)?.name ?? null,
    chat_id: chatId,
    reason: "Enquête sur un signalement",
    status: "pending",
  });
  if (error) throw error;
  return { ok: true };
}

export async function listAccessGrants() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("message_access_grants")
    .select("id, reported_name, chat_id, status, created_at, decided_at, reporter:reporter_id (name, pseudo)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as {
    id: string; reported_name: string | null; chat_id: string | null; status: string;
    created_at: string; decided_at: string | null; reporter: Person | null;
  }[];
}

/** Conversation accessible à l'admin UNIQUEMENT si un consentement « granted »
 *  existe pour ce chat. Sinon renvoie null (accès refusé). */
export async function getGrantedConversation(chatId: string) {
  const supabase = createAdminClient();
  const { data: grant } = await supabase
    .from("message_access_grants")
    .select("id")
    .eq("chat_id", chatId)
    .eq("status", "granted")
    .maybeSingle();
  if (!grant) return null;
  return getConversation(chatId);
}
