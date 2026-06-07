"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { formatEventDate } from "@/lib/date";
import { Bell, MessageSquare, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  read: boolean;
  createdAt: any;
};

const icons: Record<string, any> = {
  new_message: MessageSquare,
  application_received: Bell,
  application_accepted: CheckCircle2,
  application_rejected: XCircle,
  address_revealed: MapPin,
};

export function NotificationsList() {
  const { user, getIdToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

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
        return (
          <Card key={n.id} className={cn("flex items-start gap-4 p-4", !n.read && "bg-accent/5 border-accent/20")}>
            <div className={cn("rounded-full p-2", !n.read ? "bg-accent text-white" : "bg-white/10 text-muted")}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="grid gap-1">
              <h3 className="font-semibold text-sm">{n.title}</h3>
              <p className="text-xs text-muted">{formatEventDate(n.createdAt)}</p>
            </div>
            {!n.read && <div className="ml-auto h-2 w-2 rounded-full bg-accent" />}
          </Card>
        );
      })}
      {notifications.length === 0 && (
        <div className="py-12 text-center text-muted italic">Aucune notification pour le moment.</div>
      )}
    </div>
  );
}
