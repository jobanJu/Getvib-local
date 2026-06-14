"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Ce composant gère les cas où Supabase renvoie un hash (#access_token=...) 
 * au lieu d'un code ?code=... dans l'URL (flux implicite vs PKCE).
 * Il détecte l'événement 'PASSWORD_RECOVERY' et redirige vers la page de mise à jour.
 */
export function PasswordRecoveryHandler() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Écouter les changements d'état d'auth (PASSWORD_RECOVERY est déclenché par le lien mail)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push("/settings/update-password");
      }
    });

    // 2. Vérification manuelle immédiate du hash (au cas où l'événement a déjà eu lieu)
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
        router.push("/settings/update-password");
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return null;
}
