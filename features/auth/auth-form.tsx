"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase/client";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("Vérification...");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (mode === "signup") {
        const name = String(formData.get("name") || "");
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/discover");
    } catch {
      setMessage("Impossible de valider ces identifiants.");
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
      <p className="min-h-5 text-sm font-semibold text-muted">{message}</p>
    </form>
  );
}
