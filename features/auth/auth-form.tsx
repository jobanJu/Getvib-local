"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const supabase = createClient();

  async function handleGoogleLogin() {
    setMessage("Connexion Google...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/discover`
      }
    });
    if (error) {
      setMessage(`Erreur Google: ${error.message}`);
    }
  }

  async function submit(formData: FormData) {
    setMessage("Vérification...");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (mode === "signup") {
        const name = String(formData.get("name") || "");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name
            }
          }
        });
        if (error) throw error;
        // Si la confirmation d'email est activée, aucune session n'est créée :
        // l'utilisateur doit confirmer son adresse avant de pouvoir se connecter.
        if (!data.session) {
          setMessage("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.");
          return;
        }
        setMessage("Compte créé avec succès. Vous êtes connecté.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      router.push("/discover");
    } catch (error: any) {
      console.error("Auth error details:", error);
      setMessage(`Erreur : ${error.message || "Erreur inconnue"}`);
    }
  }

  return (
    <form action={submit} className="mt-5 grid gap-4">
      {mode === "signup" && (
        <label className="grid gap-2 text-sm font-semibold">
          Prénom
          <Input name="name" required autoComplete="given-name" />
        </label>
      )}
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <Input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Mot de passe
        <Input name="password" type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
      </label>
      <Button type="submit">{mode === "signup" ? "Créer mon compte" : "Se connecter"}</Button>
      
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted">Ou</span></div>
      </div>

      <Button type="button" variant="secondary" onClick={handleGoogleLogin}>
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuer avec Google
      </Button>

      <p className="min-h-5 text-sm font-semibold text-muted text-center">{message}</p>
    </form>
  );
}

