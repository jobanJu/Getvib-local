"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/auth-provider";
import { useRouter } from "next/navigation";

export function ApplicationForm({ eventId }: { eventId: string }) {
  const { user, getIdToken } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    
    setLoading(true);
    try {
      const idToken = await getIdToken();
      const res = await fetch(`/api/events/${eventId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      setStatus("success");
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
        Candidature envoyée avec succès ! L&#39;hôte reviendra vers vous prochainement.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Pourquoi souhaitez-vous rejoindre cette soirée ?
        <Textarea 
          placeholder="Expliquez votre vibe, simplement." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={loading}
        />
      </label>
      {status === "error" && (
        <p className="text-xs text-red-400">Une erreur est survenue, réessayez.</p>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Envoi..." : "Envoyer ma candidature"}
      </Button>
    </form>
  );
}
