"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { useTheme } from "@/features/auth/theme-provider";
import { Card } from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/profile-form";
import { Moon, Sun, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";

export default function SettingsPage() {
  const { user, profile, loading } = useAuth();
  const { theme, setTheme } = useTheme();

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-black">Paramètres</h1>

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Sun className="h-5 w-5 text-accent" />
            Apparence
          </h2>
          <Card className="flex items-center justify-between p-6 border-foreground/10 bg-foreground/5 backdrop-blur-sm">
            <div>
              <p className="font-bold">Mode {theme === "dark" ? "Sombre" : "Clair"}</p>
              <p className="text-sm text-muted">Basculez entre le mode clair et sombre.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="gap-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              Changer
            </Button>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <UserRound className="h-5 w-5 text-accent" />
            Mon Profil
          </h2>
          <Card className="p-6 border-foreground/10 bg-foreground/5 backdrop-blur-sm">
            <ProfileForm user={profile || { id: user.id, name: user.user_metadata?.display_name, email: user.email }} />
          </Card>
        </section>
      </div>
    </div>
  );
}
