import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({ accepted_terms: true })
      .eq("id", user.id)
      .select("id");

    if (error) throw error;

    // Si data est vide ou null, l'update n'a touché aucune ligne.
    if (!data || data.length === 0) {
      console.log("Profile not found during update, creating it...");
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ 
          id: user.id, 
          email: user.email, 
          accepted_terms: true,
          name: user.user_metadata?.display_name || "",
          city: user.user_metadata?.city || ""
        });
      if (insertError) throw insertError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string; code?: string; details?: string; hint?: string };
    return NextResponse.json(
      {
        error: e?.message || "Unexpected error",
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
      },
      { status: 400 },
    );
  }
}
