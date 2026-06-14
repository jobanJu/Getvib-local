"use client";

import { useState } from "react";
import { UserPlus, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "none" | "friends" | "sent" | "received";

export function FriendActionButton({ targetId, initialStatus }: { targetId: string; initialStatus: Status }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function add() {
    setLoading(true);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      if (res.ok) setStatus("sent");
    } finally {
      setLoading(false);
    }
  }

  if (status === "friends")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-400">
        <Check className="h-4 w-4" /> Amis
      </span>
    );
  if (status === "sent")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-foreground/5 px-4 py-2 text-sm font-bold text-muted">
        <Clock className="h-4 w-4" /> Demande envoyée
      </span>
    );
  if (status === "received")
    return <span className="rounded-xl bg-accent/10 px-4 py-2 text-sm font-bold text-accent">Demande reçue — réponds dans Amis</span>;

  return (
    <Button onClick={add} loading={loading}>
      <UserPlus className="h-4 w-4" /> Ajouter en ami
    </Button>
  );
}
