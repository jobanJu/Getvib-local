import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-black italic uppercase text-accent">Rejoindre GetVib</h1>
        <p className="mt-2 text-sm text-muted">Créez votre profil pour accéder aux meilleures soirées privées.</p>
        <AuthForm mode="signup" />
        <div className="mt-6 border-t border-foreground/10 pt-4 text-center">
          <p className="text-sm text-muted">
            Déjà inscrit ? <Link className="font-bold text-accent hover:underline" href="/login">Se connecter</Link>
          </p>
        </div>
      </Card>
    </section>
  );
}
