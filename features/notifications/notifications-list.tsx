"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { formatEventDate } from "@/lib/date";
import { Bell, MessageSquare, CheckCircle2, XCircle, MapPin, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  link?: string;
  read: boolean;
  createdAt: any;
};

const icons: Record<string, any> = {
  new_message: MessageSquare,
  application_received: Bell,
  application_accepted: CheckCircle2,
  application_rejected: XCircle,
  address_revealed: MapPin,
  friend_request: UserPlus,
};

export function NotificationsList() {
  const { user, getIdToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (user) {
        fetchNotifications();

        const channel = supabase
            .channel(`notifications_list_${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, [user, supabase]);

  async function fetchNotifications() {
    try {
      const idToken = await getIdToken();
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="py-12 text-center text-muted">Chargement...</div>;

  return (
    <div className="grid gap-3">
      {notifications.map((n) => {
        const Icon = icons[n.type] || Bell;
        const CardContent = (
          <>
            <div className={cn("rounded-full p-2 shrink-0", !n.read ? "bg-accent text-white shadow-[0_0_15px_rgba(246,51,154,0.3)]" : "bg-foreground/5 text-muted")}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="grid gap-1 flex-1 min-w-0">
              <h3 className={cn("text-sm leading-tight", !n.read ? "font-black" : "font-semibold")}>{n.title}</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{formatEventDate(n.createdAt)}</p>
            </div>
            {!n.read && <div className="ml-auto h-2 w-2 rounded-full bg-accent animate-pulse" />}
          </>
        );

        return n.link ? (
            <a 
                key={n.id} 
                href={n.link}
                className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] active:scale-[0.99]", 
                    !n.read ? "bg-accent/5 border-accent/20" : "bg-card border-foreground/5"
                )}
            >
                {CardContent}
            </a>
        ) : (
            <Card key={n.id} className={cn("flex items-start gap-4 p-4", !n.read && "bg-accent/5 border-accent/20")}>
                {CardContent}
            </Card>
        );
      })}
      {notifications.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-foreground/5 flex items-center justify-center text-muted/30">
                <Bell className="h-10 w-10" />
            </div>
            <p className="text-muted text-sm italic">Aucune notification pour le moment.</p>
        </div>
      )}
    </div>
  );
}
