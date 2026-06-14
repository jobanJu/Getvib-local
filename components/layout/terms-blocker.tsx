"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { ShieldCheck } from "lucide-react";

const commandements = [
  { id: 1, title: "Mineurs interdits", text: "GetVib est strictement réservé aux personnes majeures (+18 ans)." },
  { id: 2, title: "Consentement photo", text: "Les photos et vidéos de la soirée sont interdites, sauf accord explicite de l'hôte." },
  { id: 3, title: "Comportement exemplaire", text: "Tout comportement troublant, harcèlement ou geste déplacé entraîne une suspension immédiate." },
  { id: 4, title: "Vibe partagée", text: "Respectez l'ambiance définie par l'hôte. On vient pour partager une passion." },
  { id: 5, title: "Confidentialité de l'adresse", text: "L'adresse révélée doit rester privée. Ne la partagez jamais." },
  { id: 6, title: "Ponctualité", text: "Arrivez à l'heure indiquée. Un retard perturbe l'organisation." },
  { id: 7, title: "Zéro drogue", text: "La possession ou consommation de substances illicites est strictement interdite." },
  { id: 8, title: "Respect du voisinage", text: "Soyez discret en arrivant et en partant." },
  { id: 9, title: "Profil authentique", text: "Votre photo de profil doit être une vraie photo de vous." },
  { id: 10, title: "Communication via l'app", text: "Privilégiez le chat GetVib pour votre sécurité." },
  { id: 11, title: "Contribution juste", text: "Réglez votre participation dès votre arrivée pour les Vib+." },
  { id: 12, title: "Pas de démarchage", text: "GetVib est un lieu de rencontre amicale, pas de prospection." },
  { id: 13, title: "Esprit communautaire", text: "Signalez tout problème via le chat de support." },
  { id: 14, title: "Respect des lieux", text: "Traitez la maison de l'hôte avec soin." },
  { id: 15, title: "Consommation responsable", text: "L'ivresse manifeste n'est jamais acceptée." },
  { id: 16, title: "Pas d'invités surprise", text: "Seuls les profils validés sur l'app peuvent entrer." },
  { id: 17, title: "Droit de l'hôte", text: "L'hôte est souverain chez lui." },
  { id: 18, title: "Hygiène et tenue", text: "Venez avec une tenue propre et adaptée." },
];

export function TermsBlocker() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [refused, setRefused] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!user || profile?.accepted_terms || accepted) return null;

  async function handleAccept() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/profile/accept-terms", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error([data.error, data.code, data.details].filter(Boolean).join(" · ") || `Erreur ${res.status}`);
      }
      // Débloque immédiatement, sans dépendre du rechargement du contexte.
      setAccepted(true);
      await refreshProfile();
    } catch (error: unknown) {
      console.error("Acceptation de la charte échouée:", error);
      setErrorMsg(error instanceof Error ? error.message : "Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function handleRefuse() {
    // Refus : on garde le mur affiché, l'accès reste bloqué.
    setRefused(true);
    setErrorMsg("");
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full py-10">
        <section className="grid gap-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold">
              <ShieldCheck className="h-4 w-4" />
              Étape Obligatoire
            </div>
            <h1 className="text-4xl font-black italic uppercase text-foreground">La Charte de Confiance</h1>
            <p className="text-muted">Vous devez lire et accepter nos 18 commandements pour accéder à GetVib.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {commandements.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-foreground/5 bg-foreground/5 relative">
                <span className="absolute top-2 right-3 text-2xl font-black text-foreground/5 italic">{item.id}</span>
                <h3 className="font-bold text-foreground text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 bg-accent/5 p-6 rounded-2xl border border-accent/20">
            <p className="text-sm text-center text-muted italic">
              En cliquant sur « J&apos;accepte », je m&apos;engage à respecter scrupuleusement ces 18 règles sous peine de suspension immédiate de mon compte.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                onClick={handleRefuse}
                disabled={loading}
                variant="secondary"
                size="lg"
                className="px-8 py-7 text-base font-bold uppercase"
              >
                Je refuse
              </Button>
              <Button
                onClick={handleAccept}
                disabled={loading}
                size="lg"
                className="px-12 py-7 text-lg font-black uppercase italic"
              >
                {loading ? "Validation..." : "J'ai lu et j'accepte"}
              </Button>
            </div>
            {refused && (
              <p className="text-sm font-semibold text-danger text-center">
                Accès bloqué. L&apos;acceptation de la charte est obligatoire pour entrer sur GetVib.
              </p>
            )}
            {errorMsg && (
              <p className="text-sm font-semibold text-danger text-center">{errorMsg}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
