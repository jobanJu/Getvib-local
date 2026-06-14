import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_EMAIL } from "@/lib/email";

// Chat de support PRIORITAIRE — réservé aux membres Vib+++ (is_premium).
// Ouvre (ou récupère) une conversation privée directe entre le membre et le
// compte support (profil dont l'e-mail = ADMIN_EMAIL). Réutilise l'infra de
// messagerie existante (chats privés). Tout passe par le service role.
export async function POST() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const supabase = createAdminClient();

    // 1. L'utilisateur doit être premium.
    const { data: me } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    if (!me?.is_premium) {
      return NextResponse.json(
        { error: "Le chat prioritaire est réservé aux membres Vib+++." },
        { status: 403 },
      );
    }

    // 2. Trouver le compte support.
    const { data: support } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

    if (!support?.id) {
      return NextResponse.json(
        { error: "Le support est momentanément indisponible." },
        { status: 503 },
      );
    }

    // 3. Conversation déjà existante ?
    const { data: existing } = await supabase.rpc("get_private_chat", {
      uid1: user.id,
      uid2: support.id,
    });
    if (existing) {
      const chatId = typeof existing === "string" ? existing : existing.id;
      return NextResponse.json({ chatId });
    }

    // 4. Sinon on la crée (chat privé sans événement) + les deux participants.
    const { data: newChat, error: chatErr } = await supabase
      .from("chats")
      .insert({ type: "private" })
      .select()
      .single();
    if (chatErr) throw chatErr;

    await supabase.from("chat_participants").insert([
      { chat_id: newChat.id, user_id: user.id },
      { chat_id: newChat.id, user_id: support.id },
    ]);

    return NextResponse.json({ chatId: newChat.id });
  } catch (error) {
    console.error("[priority-chat]", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }
}
