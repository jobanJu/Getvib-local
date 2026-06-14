import { ShieldX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default function BannedPage() {
  return (
    <section className="mx-auto grid min-h-screen max-w-md content-center px-4 py-8">
      <Card className="p-8 text-center border-danger/20 bg-danger/5">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
          <ShieldX className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black uppercase text-danger">Compte suspendu</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Ton accès à GetVib a été suspendu pour non-respect des règles de la communauté. 
          Si tu penses qu&#39;il s&#39;agit d&#39;une erreur, contacte le support.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <a 
            href="mailto:support@getvib.fr" 
            className="rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background transition hover:opacity-90"
          >
            Contacter le support
          </a>
          <SignOutButton />
        </div>
      </Card>
    </section>
  );
}
