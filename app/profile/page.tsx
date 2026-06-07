"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRound, Settings, LogOut, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto grid max-w-md content-center px-4 py-16">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Votre profil GetVib</h1>
          <p className="text-muted text-sm">Connectez-vous pour voir vos soirées et vos badges.</p>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black tracking-tight">Profil</h1>
        <Button variant="secondary" size="icon" asChild>
          <Link href="/settings"><Settings className="h-5 w-5" /></Link>
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center text-white">
            <UserRound className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.user_metadata?.display_name || "Explorateur Vib"}</h2>
            <p className="text-muted text-sm">{user.email}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-xl font-bold mt-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" />
          Mes soirées
        </h3>
        <Card className="p-8 text-center border-dashed border-2">
          <p className="text-muted text-sm italic">Vous n&#39;avez pas encore organisé de soirée.</p>
          <Button asChild variant="ghost" className="mt-2">
            <Link href="/create">Organiser ma première vibe</Link>
          </Button>
        </Card>

        <Button 
          variant="secondary" 
          className="mt-8 text-red-400 border-red-400/20 hover:bg-red-400/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </section>
  );
}
