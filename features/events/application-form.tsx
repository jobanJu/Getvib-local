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
    <div className="grid gap-4">
      <p className="text-sm text-muted leading-relaxed">
        Votre profil sera envoyé à l&#39;hôte pour validation. Vous recevrez une notification dès qu&#39;il aura fait son choix.
      </p>
      {status === "error" && (
        <p className="text-xs text-red-400">Une erreur est survenue, réessayez.</p>
      )}
      <Button onClick={onSubmit} className="w-full py-6 text-lg font-bold" loading={loading}>
        {loading ? "Envoi..." : "Rejoindre la vibe"}
      </Button>
    </div>
  );
}
