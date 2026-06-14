"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSignupSuccess] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setMessage("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSignupSuccess(true);
      setTimeout(() => {
        router.push("/discover");
      }, 3000);
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="mx-auto grid min-h-screen max-w-md content-center px-4 py-8">
        <Card className="p-8 text-center border-emerald-500/20 bg-emerald-500/5">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black uppercase text-emerald-600">Succès !</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Ton mot de passe a été mis à jour avec succès. Redirection vers la vibe en cours...
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-md content-center px-4 py-8">
      <Card className="p-8 shadow-2xl">
        <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black uppercase">Nouveau mot de passe</h1>
            <p className="text-sm text-muted mt-2">Saisis ton nouveau mot de passe pour sécuriser ton compte.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <label className="grid gap-2 text-sm font-semibold">
            Nouveau mot de passe
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              minLength={8}
              autoFocus
            />
          </label>

          <Button type="submit" disabled={loading} className="py-6 text-lg font-bold">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? "Mise à jour..." : "Enregistrer le mot de passe"}
          </Button>

          {message && (
            <p className="text-xs font-bold text-center text-danger bg-danger/10 p-3 rounded-xl border border-danger/20">
              {message}
            </p>
          )}
        </form>
      </Card>
    </section>
  );
}
