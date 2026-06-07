import { UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/profile-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <section className="mx-auto grid max-w-2xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">Paramètres</h1>
      
      <div className="grid gap-6">
        <section>
          <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
            <UserRound className="h-5 w-5 text-accent" />
            Mon Profil
          </h2>
          <Card className="p-6 border-white/10 bg-black/20 backdrop-blur-sm">
            <ProfileForm user={profile || { id: user.id, name: user.user_metadata?.display_name, email: user.email }} />
          </Card>
        </section>

        <section className="opacity-50 pointer-events-none">
          <h2 className="mb-4 text-xl font-bold">Autres réglages (Bientôt)</h2>
          <Card className="p-5 text-sm text-muted italic">
            Confidentialité, Notifications et PWA seront disponibles dans la prochaine version.
          </Card>
        </section>
      </div>
    </section>
  );
}
