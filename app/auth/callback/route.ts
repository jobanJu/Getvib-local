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
      const userId = data.user.id;
      const { data: profile } = await supabase
        .from("profiles")
        .select("pseudo, age")
        .eq("id", userId)
        .single();

      // Si c'est un lien de récupération de mot de passe, Supabase pose une session spéciale.
      // Le paramètre 'next' devrait déjà pointer vers /settings/update-password
      
      // Priorité 1 : Onboarding si profil inexistant (ex: premier login via OAuth ou Recovery d'un compte non fini)
      if (!profile?.pseudo || !profile?.age) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Priorité 2 : Redirection demandée
      return NextResponse.redirect(`${origin}${next}`);
    } else if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Si on arrive ici sans code, c'est peut-être un hash (#). 
  // On redirige vers login qui a maintenant un handler client pour ça.
  return NextResponse.redirect(`${origin}/login`);
}
