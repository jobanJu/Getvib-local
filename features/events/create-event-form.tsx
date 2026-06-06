"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/auth-provider";

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

    setStatus(response.ok ? "Soirée publiée." : "Connexion requise ou données invalides.");
  }

  return (
    <Card>
      <form action={submit} className="grid gap-4 p-5">
        <label className={fields}>Titre<Input name="title" required /></label>
        <label className={fields}>Description<Textarea name="description" required /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fields}>Image<Input name="image" type="url" placeholder="https://..." /></label>
          <label className={fields}>Vibe<Input name="vibe" required placeholder="Jazz, Gaming..." /></label>
          <label className={fields}>Date<Input name="date" type="date" required /></label>
          <label className={fields}>Heure<Input name="time" type="time" required /></label>
          <label className={fields}>Ville<Input name="city" required placeholder="Lille Centre" /></label>
          <label className={fields}>Adresse<Input name="address" required /></label>
          <label className={fields}>Participants max<Input name="maxParticipants" type="number" min="2" max="30" required /></label>
          <label className={fields}>Âge minimum<Input name="minAge" type="number" min="18" required /></label>
          <label className={fields}>Âge maximum<Input name="maxAge" type="number" min="18" required /></label>
          <label className={fields}>
            Type
            <select name="type" className="h-12 rounded-xl border border-border bg-white/8 px-4 text-sm text-white" required>
              <option value="vib">Vib</option>
              <option value="vibplus">Vib+</option>
            </select>
          </label>
          <label className={fields}>Montant participation<Input name="contributionAmount" type="number" min="0" defaultValue="0" /></label>
          <label className={fields}>Raison participation<Input name="contributionReason" placeholder="5€ pour les bières" /></label>
        </div>
        <label className={fields}>Centres d&#39;intérêt recherchés<Input name="interestsRequired" placeholder="Jazz, gastronomie, chill" /></label>
        <Button type="submit">Publier la soirée</Button>
        <p className="min-h-5 text-sm font-semibold text-muted">{status}</p>
      </form>
    </Card>
  );
}
