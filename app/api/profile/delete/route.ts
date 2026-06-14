import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// Suppression définitive du compte : on supprime l'utilisateur auth (service
// role) → cascade sur profiles et toutes les données liées (FK on delete cascade).
export async function POST() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Suppression impossible." }, { status: 400 });
  }
}
