"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RequestMessageAccess({ reportId }: { reportId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");

  async function request() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      setState(res.ok ? "sent" : "idle");
    } catch {
      setState("idle");
    }
  }

  if (state === "sent") return <span className="text-xs font-semibold text-accent">Demande envoyée ✓</span>;

  return (
    <button
      onClick={request}
      disabled={state === "loading"}
      className="inline-flex items-center gap-1 text-xs font-semibold text-muted transition hover:text-accent disabled:opacity-50"
    >
      <ShieldQuestion className="h-3.5 w-3.5" /> Demander l&#39;accès aux messages
    </button>
  );
}

export function VerificationDecision({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function decide(approve: boolean) {
    setLoading(approve ? "approve" : "reject");
    try {
      const res = await fetch("/api/admin/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, approve }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <Button size="sm" onClick={() => decide(true)} loading={loading === "approve"} className="flex-1 bg-emerald-500 text-white hover:opacity-90">
        <Check className="h-4 w-4" /> Valider « Le Jeune »
      </Button>
      <Button size="sm" variant="secondary" onClick={() => decide(false)} loading={loading === "reject"}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function DismissReport({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function dismiss() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={dismiss} loading={loading} className="shrink-0">
      Traité
    </Button>
  );
}

export function BanUserAction({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleBan() {
    let until: string | null = null;
    
    if (!isBanned) {
      const choice = prompt(
        "DURÉE DU BANNISSEMENT :\n1: 24 Heures\n2: 7 Jours\n3: 30 Jours\n4: Permanent\n\nTapez le chiffre correspondant :", 
        "4"
      );
      
      if (choice === null) return; // Annulé
      
      const now = new Date();
      if (choice === "1") {
        now.setHours(now.getHours() + 24);
        until = now.toISOString();
      } else if (choice === "2") {
        now.setDate(now.getDate() + 7);
        until = now.toISOString();
      } else if (choice === "3") {
        now.setDate(now.getDate() + 30);
        until = now.toISOString();
      } else if (choice === "4") {
        until = null;
      } else {
        alert("Choix invalide.");
        return;
      }
    } else {
      if (!confirm("Voulez-vous débannir cet utilisateur ?")) return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, banned: !isBanned, until }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      size="sm" 
      variant={isBanned ? "secondary" : "danger"} 
      onClick={toggleBan} 
      loading={loading}
      className="h-8 px-2 text-[10px] font-bold uppercase tracking-tighter"
    >
      {isBanned ? "Débannir" : "Bannir"}
    </Button>
  );
}
