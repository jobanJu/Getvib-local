import { createAdminClient } from "@/lib/supabase/admin";
import { parseString } from "@/lib/validation";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";

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

  // Notifie l'admin par e-mail pour pouvoir intervenir vite (service role : on
  // peut lire les noms des deux profils malgré la RLS).
  try {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", [reporterId, targetUserId]);
    const reporter = profiles?.find((p) => p.id === reporterId);
    const target = profiles?.find((p) => p.id === targetUserId);

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `🚨 Signalement — ${target?.name || targetUserId}`,
      html: `
        <h2>Nouveau signalement GetVib</h2>
        <p><strong>Signalé :</strong> ${target?.name || "—"} (${target?.email || targetUserId})</p>
        <p><strong>Par :</strong> ${reporter?.name || "—"} (${reporter?.email || reporterId})</p>
        <p><strong>Motif :</strong></p>
        <blockquote style="border-left:3px solid #f6339a;padding-left:12px;color:#444">${reason}</blockquote>
        <p style="color:#888;font-size:12px">Signalement #${data.id}</p>
      `,
    });
  } catch (e) {
    // L'e-mail ne doit jamais faire échouer le signalement lui-même.
    console.error("[reports] échec notification e-mail :", e);
  }

  return {
    id: data.id,
    reporterId: data.reporter_id,
    targetUserId: data.target_user_id,
    reason: data.reason,
    createdAt: data.created_at,
  };
}
