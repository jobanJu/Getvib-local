import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Callback OAuth (Google) : Supabase redirige ici avec un `code` qu'il faut
// échanger contre une session (flux PKCE de @supabase/ssr). SANS cette route, la
// connexion Google ne pose jamais les cookies de session → l'utilisateur revient
// « non connecté ». On échange le code puis on redirige vers `next`.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // On récupère 'next' ou on vérifie si c'est un flux de récupération
  let next = searchParams.get("next") || "/discover";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Si l'utilisateur vient d'un mail de reset, on force la redirection
      // vers le changement de mot de passe si c'est ce qui était prévu.
      
      const userId = data.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("pseudo, age")
        .eq("id", userId)
        .single();

      // Priorité : Onboarding si profil incomplet
      if (!profile?.pseudo || !profile?.age) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fallback si erreur ou pas de code
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
