"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, ShieldCheck, Star } from "lucide-react";

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
  const supabase = createClient();

  if (!user || profile?.accepted_terms) return null;

  async function handleAccept() {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ accepted_terms: true })
        .eq("id", user?.id);

      if (error) throw error;
      await refreshProfile();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-4xl font-black italic uppercase text-white">La Charte de Confiance</h1>
            <p className="text-muted">Vous devez lire et accepter nos 18 commandements pour accéder à GetVib.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {commandements.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-white/5 bg-white/5 relative">
                <span className="absolute top-2 right-3 text-2xl font-black text-white/5 italic">{item.id}</span>
                <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 bg-accent/5 p-6 rounded-2xl border border-accent/20">
            <p className="text-sm text-center text-muted italic">
              "En cliquant sur le bouton ci-dessous, je m'engage à respecter scrupuleusement ces 18 règles sous peine de suspension immédiate de mon compte."
            </p>
            <Button onClick={handleAccept} disabled={loading} size="lg" className="w-full sm:w-auto px-12 py-7 text-lg font-black uppercase italic">
              {loading ? "Validation..." : "J'ai lu et j'accepte le règlement"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
