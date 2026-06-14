"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { CITIES_BY_REGION } from "@/lib/constants";

type Props = {
  userId: string;
  initialName: string;
  initialPhoto: string | null;
};

// Étape de complétion de profil — surtout pour les connexions Google (qui ne
// fournissent que nom + e-mail). On collecte le pseudo (obligatoire et unique),
// l'âge, la région et la ville. L'utilisateur est déjà authentifié ici.
export function OnboardingForm({ userId, initialName, initialPhoto }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [pseudo, setPseudo] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("France");
  const [city, setCity] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhoto);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const citiesInRegion = CITIES_BY_REGION[region as keyof typeof CITIES_BY_REGION] || [];

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${userId}-${Math.random()}.${ext}`;
      const { error } = await supabase.storage.from("profiles").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("profiles").getPublicUrl(path);
        setPhotoUrl(data.publicUrl);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const pseudoClean = pseudo.trim().toLowerCase().replace(/^@+/, "");
      if (!/^[a-z0-9_]{3,20}$/.test(pseudoClean)) {
        throw new Error("Pseudo invalide : 3 à 20 caractères, lettres minuscules, chiffres ou _.");
      }
      const ageNum = Number(age);
      if (!Number.isInteger(ageNum) || ageNum < 18 || ageNum > 99) {
        throw new Error("Tu dois avoir 18 ans ou plus.");
      }
      const check = await fetch(`/api/profile/check-pseudo?pseudo=${encodeURIComponent(pseudoClean)}`).then((r) => r.json());
      if (!check.available) throw new Error(check.error || "Ce pseudo est déjà pris.");

      const { error } = await supabase
        .from("profiles")
        .update({ name, pseudo: pseudoClean, age: ageNum, region, city, photo_url: photoUrl })
        .eq("id", userId);
      if (error) {
        if ((error as { code?: string }).code === "23505") throw new Error("Ce pseudo est déjà pris.");
        throw error;
      }

      router.push("/discover");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4">
      <div className="flex justify-center">
        <label className="relative cursor-pointer">
          <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-2 border-dashed border-foreground/20 bg-foreground/5">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-muted" />
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-accent p-1.5 text-white">
            <Plus className="h-4 w-4" />
          </span>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Nom complet
        <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Prénom Nom" />
      </label>

      <label className="grid gap-2 text-sm font-semibold">
        Pseudo
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">@</span>
          <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} required placeholder="lele59" className="pl-7" />
        </div>
        <p className="text-[10px] italic text-muted">Ton identifiant unique pour que tes amis te retrouvent.</p>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Âge
          <Input value={age} onChange={(e) => setAge(e.target.value)} type="number" min="18" max="99" required placeholder="25" />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Pays / Région
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="h-11 w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 text-sm font-medium outline-none focus:border-accent"
          >
            {Object.keys(CITIES_BY_REGION).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Ville
        <Input value={city} onChange={(e) => setCity(e.target.value)} required placeholder={`Ex : ${citiesInRegion[0] || "Paris"}`} list="cities-onboarding" />
        <datalist id="cities-onboarding">
          {citiesInRegion.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>

      <Button type="submit" disabled={loading} className="py-6 text-lg font-bold">
        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        Entrer dans GetVib
      </Button>

      {message && <p className="text-center text-sm font-semibold text-danger">{message}</p>}
    </form>
  );
}
