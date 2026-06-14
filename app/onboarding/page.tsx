import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/features/auth/onboarding-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "Compléter mon profil · GetVib" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, pseudo, age, photo_url")
    .eq("id", user.id)
    .single();

  // Profil déjà complet → rien à faire ici.
  if (profile?.pseudo && profile?.age) redirect("/discover");

  const initialName = profile?.name || user.user_metadata?.display_name || user.user_metadata?.full_name || "";

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-8 animate-fade-in-up">
      <Card className="p-6">
        <h1 className="text-3xl font-black italic uppercase text-accent">Bienvenue 🥂</h1>
        <p className="mt-2 text-sm text-muted">
          Plus qu&#39;une étape : complète ton profil pour entrer dans la vibe.
        </p>
        <OnboardingForm userId={user.id} initialName={initialName} initialPhoto={profile?.photo_url || null} />
      </Card>
    </section>
  );
}
