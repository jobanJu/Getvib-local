"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";

export function RealtimeNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new;
          toast({
            title: newNotif.title,
            type: "notification",
            link: newNotif.link,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, toast]);

  return null;
}
