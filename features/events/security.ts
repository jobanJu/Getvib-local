import { createAdminClient } from "@/lib/supabase/admin";

export async function assertEventHost(eventId: string, userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("events").select("host_id").eq("id", eventId).single();
  
  if (error || !data) throw new Error("Event not found.");
  if (data.host_id !== userId) throw new Error("Forbidden: You are not the host.");
}
