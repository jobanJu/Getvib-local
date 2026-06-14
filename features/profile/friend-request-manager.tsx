"use client";

import { useState, useEffect } from "react";
import { User, Check, X, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";

type Request = {
  id: string;
  userId: string;
  name: string;
  photo_url: string | null;
  city: string | null;
};

export function FriendRequestManager({ initialRequests }: { initialRequests: Request[] }) {
  const { user, getIdToken } = useAuth();
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`friend_requests_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE (status), DELETE
          schema: "public",
          table: "friendships",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          // On recharge les demandes pour avoir les infos de profil complètes (nom, photo)
          const token = await getIdToken();
          const res = await fetch("/api/friends/requests", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          setRequests(data.requests || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, getIdToken]);

  async function handleDecide(requestId: string, status: "accepted" | "rejected") {
    setProcessingId(requestId);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/friends/decide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, status })
      });

      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        // Idéalement, on rechargerait la liste d'amis ici ou via refresh
        window.location.reload();
      }
    } catch (error) {
      console.error("Friend decide error:", error);
    } finally {
      setProcessingId(null);
    }
  }

  if (requests.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
        <User className="h-5 w-5 text-accent" />
        Demandes d&#39;ami ({requests.length})
      </h2>
      <div className="grid gap-3">
        {requests.map((r) => (
          <Card key={r.id} className="flex items-center gap-4 p-3 border-accent/20 bg-accent/5">
            {r.photo_url ? (
              <img src={r.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="h-5 w-5 text-accent" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate">{r.name}</p>
              {r.city && (
                <p className="text-[10px] uppercase tracking-wider text-muted font-bold flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {r.city}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDecide(r.id, "rejected")}
                disabled={!!processingId}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-9 w-9 p-0 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleDecide(r.id, "accepted")}
                disabled={!!processingId}
                className="bg-emerald-500 hover:bg-emerald-400 text-white h-9 px-4 rounded-xl font-bold"
              >
                {processingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accepter"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
