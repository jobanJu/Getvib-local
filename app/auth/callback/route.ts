import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback OAuth (Google) : Supabase redirige ici avec un `code` qu'il faut
// échanger contre une session (flux PKCE de @supabase/ssr). SANS cette route, la
// connexion Google ne pose jamais les cookies de session → l'utilisateur revient
// « non connecté ». On échange le code puis on redirige vers `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/discover";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Profil incomplet (typiquement une 1re connexion Google) → étape de
      // complétion (pseudo, âge, ville…) avant d'entrer dans l'app.
      const userId = data.user?.id;
      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("pseudo, age")
          .eq("id", userId)
          .single();
        if (!profile?.pseudo || !profile?.age) return NextResponse.redirect(`${origin}/onboarding`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
