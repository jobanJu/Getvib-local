"use client";

import { useRef, useState } from "react";
import { BadgeCheck, Camera, PenLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Props = {
  verified: boolean;
  /** Prénom à recopier sur la feuille (sert de preuve anti-faux-profil) */
  firstName: string;
  /** Une demande est déjà en attente de validation */
  pending: boolean;
};

export function VerificationCard({ verified, firstName, pending }: Props) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profil déjà vérifié → badge "Le Jeune".
  if (verified) {
    return (
      <Card className="mb-6 flex items-center gap-4 border-emerald-400/30 bg-emerald-400/5 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
          <BadgeCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Profil vérifié · « Le Jeune »</h3>
          <p className="text-sm text-muted">Ton authenticité a été confirmée. Merci de faire vibrer GetVib en confiance.</p>
        </div>
      </Card>
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("images")
        .upload(`verifications/${fileName}`, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("images").getPublicUrl(`verifications/${fileName}`);
      setPhotoUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi de la photo.");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!photoUrl) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/request-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Une erreur est survenue.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done || pending) {
    return (
      <Card className="mb-6 flex items-center gap-4 border-accent/30 bg-accent/5 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Demande en cours d&#39;examen 🥂</h3>
          <p className="text-sm text-muted">
            On vérifie ta photo à la main pour traquer les faux profils. Tu recevras le badge « Le Jeune » sous 48h.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6 p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">Fais vérifier ton profil</h3>
          <p className="text-sm text-muted">
            Décroche le badge <span className="font-semibold text-foreground">« Le Jeune »</span> et inspire confiance à la communauté.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-accent/30 bg-accent/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PenLine className="h-4 w-4 text-accent" />
          Prends une photo de toi en tenant une feuille manuscrite avec :
        </p>
        <ul className="mt-2 grid gap-1.5 text-sm text-muted">
          <li>✍️ ton prénom <span className="font-semibold text-foreground">« {firstName} »</span></li>
          <li>✍️ le mot <span className="font-semibold text-foreground">« GetVib »</span></li>
          <li>🥂 une coupe de champagne dessinée à la main</li>
        </ul>
        <p className="mt-2 text-xs text-muted">
          Tout doit être écrit à la main : c&#39;est ce qui nous permet de démasquer les fausses photos.
        </p>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="Aperçu de la vérification" className="mt-4 max-h-56 w-full rounded-2xl object-cover" />
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
          className="flex-1"
        >
          {!uploading && <Camera className="h-4 w-4" />}
          {photoUrl ? "Changer la photo" : "Ajouter ma photo"}
        </Button>
        <Button onClick={submit} disabled={!photoUrl || uploading} loading={submitting} className="flex-1">
          Envoyer pour vérification
        </Button>
      </div>
    </Card>
  );
}
