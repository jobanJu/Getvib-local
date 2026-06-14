import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Synchronise la session côté SERVEUR : le client envoie ses tokens après login,
// et on pose les cookies d'auth via setSession (le client navigateur ne les
// écrivait pas de façon fiable). Indispensable pour que getUser() serveur marche.
export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = (await request.json()) as {
      access_token?: string;
      refresh_token?: string;
    };
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: "Tokens manquants." }, { status: 400 });
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur." }, { status: 400 });
  }
}
