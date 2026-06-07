import { createAdminClient } from "@/lib/supabase/admin";
import { parseString } from "@/lib/validation";

export async function createReport(reporterId: string, rawInput: unknown) {
  const input = rawInput as any;
  const targetUserId = parseString(input?.targetUserId, "Target User", 100);
  const reason = parseString(input?.reason, "Reason", 1000);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      target_user_id: targetUserId,
      reason,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    reporterId: data.reporter_id,
    targetUserId: data.target_user_id,
    reason: data.reason,
    createdAt: data.created_at,
  };
}
