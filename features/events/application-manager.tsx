"use client";

import { useState } from "react";
import { Check, X, User, MapPin, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/auth-provider";

type Application = {
  id: string;
  event_id: string;
  user_id: string;
  eventTitle: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    photo_url: string | null;
    city: string | null;
    verification_level: number;
  };
};

export function ApplicationManager({ initialApplications }: { initialApplications: any[] }) {
  const { getIdToken } = useAuth();
  const [apps, setApps] = useState<Application[]>(initialApplications);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleDecide(app: Application, status: "accepted" | "rejected") {
    setProcessingId(app.id);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/events/${app.event_id}/${status}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: app.user_id })
      });

      if (res.ok) {
        setApps(prev => prev.filter(a => a.id !== app.id));
      }
    } catch (error) {
      console.error("Decision error:", error);
    } finally {
      setProcessingId(null);
    }
  }

  if (apps.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
        <User className="h-5 w-5 text-accent" />
        Candidatures en attente
        <Badge tone="purple" className="ml-1">{apps.length}</Badge>
      </h2>
      <div className="grid gap-4">
        {apps.map((app) => (
          <Card key={app.id} className="overflow-hidden p-0 border-accent/20 bg-accent/5">
            <div className="flex flex-col sm:flex-row sm:items-center p-4 gap-4">
              {/* Avatar & Info */}
              <div className="flex items-center gap-3 flex-1">
                {app.user.photo_url ? (
                  <img src={app.user.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold truncate">{app.user.name}</p>
                    {app.user.verification_level > 0 && (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-muted truncate">
                    Pour : <span className="text-foreground font-semibold">{app.eventTitle}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {app.user.city && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted font-bold">
                        <MapPin className="h-3 w-3" /> {app.user.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end sm:justify-start">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-10 w-10 p-0 rounded-full"
                  onClick={() => handleDecide(app, "rejected")}
                  disabled={!!processingId}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button 
                  size="sm" 
                  className="bg-emerald-500 hover:bg-emerald-400 text-white h-10 px-4 rounded-xl font-bold"
                  onClick={() => handleDecide(app, "accepted")}
                  disabled={!!processingId}
                >
                  {processingId === app.id ? "..." : <><Check className="mr-2 h-5 w-5" /> Accepter</>}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
