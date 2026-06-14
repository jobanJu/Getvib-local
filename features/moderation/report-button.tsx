"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const REASONS = [
  "Faux profil / usurpation",
  "Harcèlement ou propos déplacés",
  "Comportement inapproprié en soirée",
  "Photo non conforme",
  "Spam / démarchage",
  "Autre",
];

// Signalement d'un utilisateur depuis son profil. Envoie vers /api/reports
// (table reports + notification admin par e-mail, déjà en place côté serveur).
export function ReportButton({ targetUserId, targetName }: { targetUserId: string; targetName?: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!reason) {
      setError("Choisis un motif.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fullReason = details.trim() ? `${reason} — ${details.trim()}` : reason;
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, reason: fullReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Signalement impossible.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signalement impossible.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
        <Flag className="h-4 w-4" /> Signalement envoyé. Merci, on s&#39;en occupe.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-danger"
      >
        <Flag className="h-4 w-4" /> Signaler{targetName ? ` ${targetName.split(" ")[0]}` : ""}
      </button>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-danger/30 bg-danger/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 font-bold text-foreground">
          <Flag className="h-4 w-4 text-danger" /> Signaler ce profil
        </p>
        <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2">
        {REASONS.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
              reason === r ? "border-danger bg-danger/10 text-foreground" : "border-foreground/10 text-muted hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Détails (optionnel)…"
        className="mt-3 min-h-20 w-full rounded-xl border border-foreground/10 bg-background/50 px-3 py-2 text-sm outline-none focus:border-danger"
      />

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <Button onClick={submit} loading={loading} className="mt-3 w-full bg-danger text-white hover:opacity-90">
        Envoyer le signalement
      </Button>
      <p className="mt-2 text-center text-[11px] text-muted">
        Les abus de signalement peuvent entraîner une sanction. En cas d&#39;urgence, contacte les autorités.
      </p>
    </div>
  );
}
