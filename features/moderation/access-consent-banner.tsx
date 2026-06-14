"use client";

import { useEffect, useState } from "react";
import { ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Grant = { id: string; reported_name: string | null };

// Bannière affichée au SIGNALEUR quand l'équipe demande l'accès à sa conversation
// pour enquêter sur son signalement. Consentement explicite : Accepter / Refuser.
export function AccessConsentBanner() {
  const supabase = createClient();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("message_access_grants")
        .select("id, reported_name")
        .eq("status", "pending");
      if (data) setGrants(data as Grant[]);
    })();
  }, [supabase]);

  async function decide(id: string, status: "granted" | "denied") {
    setBusy(id);
    try {
      await supabase
        .from("message_access_grants")
        .update({ status, decided_at: new Date().toISOString() })
        .eq("id", id);
      setGrants((g) => g.filter((x) => x.id !== id));
    } finally {
      setBusy(null);
    }
  }

  if (grants.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-auto max-w-md px-4 md:bottom-6">
      {grants.map((g) => (
        <div key={g.id} className="mb-2 rounded-2xl border border-accent/30 bg-card p-4 shadow-2xl">
          <p className="flex items-center gap-2 font-bold text-foreground">
            <ShieldQuestion className="h-5 w-5 text-accent" />
            Demande de l&#39;équipe GetVib
          </p>
          <p className="mt-1 text-sm text-muted">
            Pour enquêter sur ton signalement{g.reported_name ? ` contre ${g.reported_name}` : ""}, autorises-tu
            l&#39;équipe à consulter ta conversation avec cette personne ?
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => decide(g.id, "granted")} loading={busy === g.id} className="flex-1">
              J&#39;autorise
            </Button>
            <Button size="sm" variant="secondary" onClick={() => decide(g.id, "denied")} disabled={busy === g.id} className="flex-1">
              Je refuse
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
