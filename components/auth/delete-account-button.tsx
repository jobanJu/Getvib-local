"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function DeleteAccountButton({ className }: { className?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/delete", { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Suppression impossible.");
      }
      // Déconnexion locale puis retour à l'accueil.
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setConfirming(true)}
        className={className ?? "w-full text-muted hover:text-danger sm:w-auto"}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer mon compte
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-center">
      <p className="text-sm font-bold text-foreground">Supprimer définitivement ton compte ?</p>
      <p className="mt-1 text-xs text-muted">
        Cette action est <strong>irréversible</strong> : profil, vibes, amis et messages seront effacés.
      </p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button type="button" variant="secondary" onClick={() => setConfirming(false)} disabled={loading}>
          Annuler
        </Button>
        <Button type="button" onClick={remove} loading={loading} className="bg-danger text-white hover:opacity-90">
          Oui, supprimer définitivement
        </Button>
      </div>
    </div>
  );
}
