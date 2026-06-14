import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseString } from "@/lib/validation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Réclamation / support : enregistre un ticket côté serveur (suivi admin), EN
// PLUS du mail ouvert côté client. `support_tickets.user_id` est obligatoire →
// on ne persiste que pour un utilisateur connecté ; pour un visiteur anonyme, le
// mailto reste le canal (rien à stocker, pas d'erreur). Insert via service role.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; message?: unknown };
    const email = parseString(body?.email, "E-mail", 160);
    const message = parseString(body?.message, "Message", 2000);
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      await admin.from("support_tickets").insert({
        user_id: user.id,
        subject: "Réclamation / Support",
        message,
        email,
      });
      return NextResponse.json({ ok: true, saved: true });
    }

    // Visiteur non connecté : pas de persistance possible, le mailto fait le job.
    return NextResponse.json({ ok: true, saved: false });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Une erreur est survenue." }, { status: 400 });
  }
}
