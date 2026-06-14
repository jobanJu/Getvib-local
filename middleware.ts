import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Middleware Supabase (@supabase/ssr) : rafraîchit la session à chaque requête et
// synchronise les cookies entre client et serveur. SANS lui, getUser() côté
// serveur échoue dès que le token expire (~1h) → pages/API serveur « non
// connecté » alors que l'app cliente paraît connectée. Indispensable pour /admin
// et toute vérif d'auth server-side.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Rafraîchit le token si besoin et repose les cookies à jour.
  const { data: { user } } = await supabase.auth.getUser();

  // Si l'utilisateur est connecté, on vérifie s'il est banni
  if (user && !request.nextUrl.pathname.startsWith("/banned") && !request.nextUrl.pathname.startsWith("/api/auth")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_banned, banned_until")
      .eq("id", user.id)
      .single();

    if (profile?.is_banned) {
      // Si une date de fin est prévue et qu'elle est dépassée, on ne bloque pas
      if (profile.banned_until && new Date(profile.banned_until) < new Date()) {
        // Optionnel : on pourrait ici nettoyer le statut en DB, mais on laisse 
        // l'admin le faire ou un cron pour rester performant ici.
      } else {
        return NextResponse.redirect(new URL("/banned", request.url));
      }
    }
  }

  return response;
}

export const config = {
  // Exclut les assets statiques / images pour ne pas tourner inutilement.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
