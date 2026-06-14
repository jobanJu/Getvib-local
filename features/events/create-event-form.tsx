"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Calendar, Camera, Clock, Euro, ImagePlus, Loader2, Lock, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { AVAILABLE_CITIES, CITIES_BY_REGION } from "@/lib/constants";

const fields = "grid gap-2 text-sm font-semibold";

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 text-xs font-bold uppercase tracking-wider text-muted">
      <Icon className="h-4 w-4 text-accent" />
      {children}
      <span className="ml-1 h-px flex-1 bg-foreground/10" />
    </div>
  );
}

function IconInput({ icon: Icon, className, ...props }: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input className={cn("pl-10", className)} {...props} />
    </div>
  );
}

// Vibes = grandes catégories générales (le détail précis va dans les centres
// d'intérêt recherchés). Servent de base à la catégorisation / au filtrage.
const VIBES = [
  "Musique",
  "Gastronomie",
  "Art & Culture",
  "Jeux",
  "Sport",
  "Chill",
  "Fête",
  "Plein air",
];

export function CreateEventForm() {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("France");
  const [vibe, setVibe] = useState("");
  const [type, setType] = useState<"vib" | "vibplus">("vib");

  const citiesInRegion = CITIES_BY_REGION[selectedRegion as keyof typeof CITIES_BY_REGION] || [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("Téléchargement de l'image...");
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `events/${fileName}`;

      const { error } = await supabase.storage.from("images").upload(filePath, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(filePath);
      setImageUrl(publicUrl);
      setStatus("Image chargée ✓");
    } catch (error) {
      setStatus(`Erreur upload : ${error instanceof Error ? error.message : "réessayez"}`);
    } finally {
      setUploading(false);
    }
  }

  async function submit(formData: FormData) {
    if (!vibe) {
      setStatus("Erreur : choisissez une vibe.");
      return;
    }

    setSubmitting(true);
    setStatus("Publication en cours...");
    const token = await getIdToken();
    const payload = Object.fromEntries(formData.entries());

    // Si pas d'image uploadée, on en génère une par défaut basée sur la vibe
    const finalImageUrl = imageUrl || `https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=70&vibe=${encodeURIComponent(vibe)}`;

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        ...payload,
        vibe,
        type,
        region: selectedRegion,
        address: payload.address,
        image: finalImageUrl,
        contributionAmount: type === "vibplus" ? payload.contributionAmount : 0,
        interestsRequired: String(payload.interestsRequired || "").split(","),
      }),
    });

    if (response.ok) {
      const { event } = await response.json();
      setStatus("Soirée publiée ! Redirection...");
      router.push(`/event/${event.id}`);
    } else {
      setSubmitting(false);
      setStatus("Erreur : Vérifiez les données ou votre connexion.");
    }
  }

  return (
    <Card className="border-foreground/10 bg-card shadow-2xl">
      <form action={submit} className="grid gap-5 p-5">
        {/* Image — upload direct */}
        <div className={fields}>
          Photo de la soirée
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative grid aspect-[16/9] w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-foreground/20 bg-card-soft transition hover:border-accent"
          >
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
                <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Camera className="h-5 w-5" /> Changer l&#39;image
                  </span>
                </div>
              </>
            ) : (
              <span className="flex flex-col items-center gap-2 text-muted">
                {uploading ? <Loader2 className="h-7 w-7 animate-spin text-accent" /> : <ImagePlus className="h-7 w-7" />}
                <span className="text-sm font-medium">{uploading ? "Chargement..." : "Cliquez pour ajouter une photo"}</span>
                <span className="text-xs font-normal">Optionnel — une image par défaut sera utilisée sinon</span>
              </span>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        <label className={fields}>Titre<Input name="title" required placeholder="Ex: Soirée Jazz & Vin" /></label>
        <label className={fields}>Description<Textarea name="description" required placeholder="Décrivez l'ambiance..." /></label>

        {/* Vibe — sélecteur prédéfini */}
        <div className={fields}>
          Vibe <span className="font-normal text-muted">(catégorie de la soirée)</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {VIBES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVibe(v)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                  vibe === v
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-foreground/15 bg-card-soft text-muted hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Quand & Où */}
        <SectionTitle icon={Calendar}>Quand &amp; Où</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fields}>Date<IconInput icon={Calendar} name="date" type="date" required className="text-foreground [color-scheme:dark]" /></label>
          <label className={fields}>Heure<IconInput icon={Clock} name="time" type="time" required className="text-foreground [color-scheme:dark]" /></label>
          <label className={fields}>
            Pays / Région
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-11 w-full rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-1 text-sm font-medium outline-none focus:border-accent transition"
            >
              {Object.keys(CITIES_BY_REGION).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>
          <label className={fields}>
            Ville
            <IconInput 
              icon={MapPin} 
              name="city" 
              required 
              placeholder={`Ex: ${citiesInRegion[0] || "Paris"}`} 
              list="cities-create" 
            />
            <datalist id="cities-create">
              {citiesInRegion.map(city => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </label>
        </div>

        {/* Participants */}
        <SectionTitle icon={Users}>Participants</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={fields}>Nombre max d&#39;invités<IconInput icon={Users} name="maxParticipants" type="number" min="2" max="30" defaultValue="10" required /></label>
          <div className={fields}>
            Tranche d&#39;âge
            <div className="flex items-center gap-2">
              <Input name="minAge" type="number" min="18" max="99" defaultValue="18" required className="text-center" aria-label="Âge minimum" />
              <span className="shrink-0 text-sm text-muted">à</span>
              <Input name="maxAge" type="number" min="18" max="99" defaultValue="40" required className="text-center" aria-label="Âge maximum" />
              <span className="shrink-0 text-sm text-muted">ans</span>
            </div>
          </div>
        </div>

        {/* Format */}
        <SectionTitle icon={Euro}>Format</SectionTitle>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-foreground/15 bg-card-soft p-1">
          {(["vib", "vibplus"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-lg py-3 text-sm font-bold transition",
                type === t ? "bg-accent text-foreground shadow-[0_8px_24px_rgba(246,51,154,0.35)]" : "text-muted hover:text-foreground",
              )}
            >
              {t === "vib" ? "Vib · Gratuit" : "Vib+ · Payant"}
            </button>
          ))}
        </div>
        {type === "vibplus" && (
          <div className="grid gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-4 sm:grid-cols-2">
            <label className={fields}>Montant participation<IconInput icon={Euro} name="contributionAmount" type="number" min="0" max="500" defaultValue="0" /></label>
            <label className={fields}>Raison de la participation<Input name="contributionReason" placeholder="Ex: boissons et tapas" /></label>
          </div>
        )}

        {/* Profil recherché */}
        <SectionTitle icon={Sparkles}>Profil recherché</SectionTitle>
        <label className={fields}>
          <span className="flex items-center gap-2">Centres d&#39;intérêt <span className="text-xs font-normal text-muted">séparés par des virgules</span></span>
          <IconInput icon={Sparkles} name="interestsRequired" placeholder="Ex: jazz, vin nature, vinyles" />
        </label>

        <Button type="submit" disabled={submitting || uploading} className="mt-4 py-6 text-lg font-bold">
          {submitting ? "Publication..." : "Publier la soirée"}
        </Button>
        <p className={cn("min-h-5 text-center text-sm font-semibold", status.startsWith("Erreur") ? "text-danger" : "text-success")}>{status}</p>
      </form>
    </Card>
  );
}
