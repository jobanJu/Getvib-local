import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-8">
      <Card className="p-5">
        <h1 className="text-3xl font-black">Inscription</h1>
        <p className="mt-2 text-sm text-muted">Lancez votre première vibe à Lille.</p>
        <AuthForm mode="signup" />
        <p className="mt-4 text-sm text-muted">
          Déjà inscrit ? <Link className="font-semibold text-foreground" href="/login">Se connecter</Link>
        </p>
      </Card>
    </section>
  );
}
