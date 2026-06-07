"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

const fields = "grid gap-2 text-sm font-semibold";

export function CreateEventForm() {
  const { getIdToken } = useAuth();
  const [status, setStatus] = useState("");

  async function submit(formData: FormData) {
    setStatus("Publication en cours...");
    const token = await getIdToken();
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...payload,
        interestsRequired: String(payload.interestsRequired || "").split(","),
      }),
    });

    setStatus(response.ok ? "Soirée publiée !" : "Erreur : Vérifiez les données ou votre connexion.");
  }

  return (
    <Card className="border-white/10 bg-black/20 backdrop-blur-sm">
      <form action={submit} className="grid gap-4 p-5">
        <label className={fields}>Titre<Input name="title" required placeholder="Ex: Soirée Jazz & Vin" className="bg-white/5" /></label>
        <label className={fields}>Description<Textarea name="description" required placeholder="Décrivez l'ambiance..." className="bg-white/5" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fields}>Image (URL)<Input name="image" type="url" placeholder="https://images.unsplash.com/..." className="bg-white/5" /></label>
          <label className={fields}>Vibe<Input name="vibe" required placeholder="Jazz, Gaming, Chill..." className="bg-white/5" /></label>
          <label className={fields}>Date<Input name="date" type="date" required className="bg-white/5 text-white [color-scheme:dark]" /></label>
          <label className={fields}>Heure<Input name="time" type="time" required className="bg-white/5 text-white [color-scheme:dark]" /></label>
          <label className={fields}>Ville<Input name="city" required placeholder="Lille Centre" className="bg-white/5" /></label>
          <label className={fields}>Adresse (Masquée au début)<Input name="address" required placeholder="12 rue de la Paix" className="bg-white/5" /></label>
          <label className={fields}>Participants max<Input name="maxParticipants" type="number" min="2" max="30" defaultValue="10" required className="bg-white/5" /></label>
          <label className={fields}>Âge minimum<Input name="minAge" type="number" min="18" defaultValue="18" required className="bg-white/5" /></label>
          <label className={fields}>Âge maximum<Input name="maxAge" type="number" min="18" defaultValue="40" required className="bg-white/5" /></label>
          <label className={fields}>
            Type de soirée
            <select name="type" className="h-12 rounded-xl border border-border bg-white/5 px-4 text-sm text-white outline-none focus:border-accent" defaultValue="vib" required>
              <option value="vib" className="bg-card text-white">Vib (Gratuit)</option>
              <option value="vibplus" className="bg-card text-white">Vib+ (Payant)</option>
            </select>
          </label>
          <label className={fields}>Montant participation (€)<Input name="contributionAmount" type="number" min="0" defaultValue="0" className="bg-white/5" /></label>
          <label className={fields}>Raison (si payant)<Input name="contributionReason" placeholder="Ex: Pour les boissons et tapas" className="bg-white/5" /></label>
        </div>
        <label className={fields}>Centres d&#39;intérêt recherchés (Séparés par des virgules)<Input name="interestsRequired" placeholder="Musique, Cuisine, Voyages" className="bg-white/5" /></label>
        <Button type="submit" className="mt-4 py-6 text-lg font-bold">Publier la soirée</Button>
        <p className={cn("min-h-5 text-center text-sm font-semibold", status.startsWith("Erreur") ? "text-danger" : "text-success")}>{status}</p>
      </form>
    </Card>
  );
}
