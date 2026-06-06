import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md content-center px-4 py-8">
      <Card className="p-5">
        <h1 className="text-3xl font-black">Connexion</h1>
        <p className="mt-2 text-sm text-muted">Retrouvez vos soirées, messages et notifications.</p>
        <AuthForm mode="login" />
        <p className="mt-4 text-sm text-muted">
          Pas encore inscrit ? <Link className="font-semibold text-white" href="/signup">Créer un compte</Link>
        </p>
      </Card>
    </section>
  );
}
