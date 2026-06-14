import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, ADMIN_EMAIL } from "@/lib/email";
import { parseString } from "@/lib/validation";

// Vérification MANUELLE : l'utilisateur envoie une photo de lui tenant une feuille
// « GetVib » + une coupe de champagne dessinée. On enregistre la demande et on
// notifie l'admin par e-mail avec la photo. La validation (verification_level = 1)
// est faite à la main par l'admin.
export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const body = await request.json();
    const photoUrl = parseString((body as { photoUrl?: unknown })?.photoUrl, "Photo", 500);

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, verification_level")
      .eq("id", user.id)
      .single();

    if ((profile?.verification_level ?? 0) >= 1) {
      return NextResponse.json({ error: "Ton profil est déjà vérifié." }, { status: 409 });
    }

    // upsert : remplace une éventuelle demande en attente par la nouvelle photo.
    const { error: upsertError } = await supabase
      .from("verification_requests")
      .upsert(
        { user_id: user.id, photo_url: photoUrl, status: "pending" },
        { onConflict: "user_id", ignoreDuplicates: false },
      );

    // L'index unique partiel ne couvre que les lignes "pending" ; on retombe sur
    // un insert simple si l'upsert ne matche pas la contrainte attendue.
    if (upsertError) {
      const { error: insertError } = await supabase
        .from("verification_requests")
        .insert({ user_id: user.id, photo_url: photoUrl, status: "pending" });
      if (insertError) throw insertError;
    }

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `🥂 Demande de vérification — ${profile?.name || user.email}`,
      html: `
        <h2>Nouvelle demande de vérification GetVib</h2>
        <p><strong>Utilisateur :</strong> ${profile?.name || "—"} (${user.email})</p>
        <p><strong>ID :</strong> ${user.id}</p>
        <p>Photo soumise (feuille « GetVib » + coupe de champagne) :</p>
        <p><img src="${photoUrl}" alt="photo de vérification" style="max-width:420px;border-radius:12px" /></p>
        <p>Pour valider : passe <code>verification_level</code> à 1 sur ce profil.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 400 });
  }
}
