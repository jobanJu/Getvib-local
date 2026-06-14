import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { Card } from "@/components/ui/card";
import { PasswordRecoveryHandler } from "@/features/auth/password-recovery-handler";

export default function LoginPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-8">
      <PasswordRecoveryHandler />
      <Card className="p-6">
        <h1 className="text-3xl font-black italic uppercase text-accent">Connexion</h1>
        <p className="mt-2 text-sm text-muted">Retrouvez vos vibes, messages et notifications.</p>
        <AuthForm mode="login" />
        <div className="mt-6 border-t border-foreground/10 pt-4 text-center">
          <p className="text-sm text-muted">
            Pas encore inscrit ? <Link className="font-bold text-accent hover:underline" href="/signup">Créer un compte</Link>
          </p>
        </div>
      </Card>
    </section>
  );
}

