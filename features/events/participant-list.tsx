"use client";

import { useState } from "react";
import { User, X, ShieldCheck, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";

type Participant = {
  id: string;
  name: string;
  photo_url: string | null;
  city: string | null;
  verification_level: number;
};

export function ParticipantList({ eventId, initialParticipants }: { eventId: string, initialParticipants: Participant[] }) {
  const { getIdToken } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(p: Participant) {
    if (!confirm(`Voulez-vous vraiment retirer ${p.name} de la soirée ?`)) return;
    
    setRemovingId(p.id);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/events/${eventId}/remove-participant`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: p.id })
      });

      if (res.ok) {
        setParticipants(prev => prev.filter(item => item.id !== p.id));
      }
    } catch (error) {
      console.error("Remove participant error:", error);
    } finally {
      setRemovingId(null);
    }
  }

  if (participants.length === 0) {
    return (
      <Card className="p-10 border-2 border-dashed text-center">
        <p className="text-sm italic text-muted">Aucun invité pour le moment.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {participants.map((p) => (
        <Card key={p.id} className="flex items-center gap-4 p-3 bg-foreground/5">
          {p.photo_url ? (
            <img src={p.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="h-5 w-5 text-accent" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold truncate">{p.name}</p>
              {p.verification_level > 0 && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              )}
            </div>
            {p.city && (
              <p className="text-[10px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {p.city}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted hover:text-red-400 h-9 w-9 p-0 rounded-full"
            onClick={() => handleRemove(p)}
            disabled={!!removingId}
          >
            {removingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </Button>
        </Card>
      ))}
    </div>
  );
}
