"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

export function LeaveEventButton({ eventId }: { eventId: string }) {
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleLeave() {
    setLoading(true);
    try {
      const token = await getIdToken();
      // On utilise l'endpoint reject qui gère déjà la suppression de participation côté serveur
      // ou on peut créer un endpoint spécifique /leave. Utilisons /leave pour la clarté.
      const res = await fetch(`/api/events/${eventId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error leaving event:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-muted hover:text-red-400">
        Se désister
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-red-400 uppercase">Sûr ?</span>
      <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
        Non
      </Button>
      <Button 
        variant="danger" 
        size="sm" 
        onClick={handleLeave} 
        disabled={loading}
        className="h-8 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Oui"}
      </Button>
    </div>
  );
}
