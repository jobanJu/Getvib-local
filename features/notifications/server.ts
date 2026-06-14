import { createAdminClient } from "@/lib/supabase/admin";

export async function listNotifications(userId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return [];

  // Mark all as read
  const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
  if (unreadIds.length > 0) {
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    link: row.link,
    read: row.read,
    createdAt: row.created_at,
  }));
}
