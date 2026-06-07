import { AlertTriangle, BadgeCheck, CheckCircle2, LockKeyhole, ShieldCheck, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const commandements = [
  { id: 1, title: "Mineurs interdits", text: "GetVib est strictement réservé aux personnes majeures (+18 ans)." },
  { id: 2, title: "Consentement photo", text: "Les photos et vidéos de la soirée sont interdites, sauf accord explicite de l'hôte." },
  { id: 3, title: "Comportement exemplaire", text: "Tout comportement troublant, harcèlement ou geste déplacé entraîne une suspension immédiate." },
  { id: 4, title: "Vibe partagée", text: "Respectez l'ambiance définie par l'hôte (Jazz, Gaming, etc.). On vient pour partager une passion." },
  { id: 5, title: "Confidentialité de l'adresse", text: "L'adresse révélée doit rester privée. Ne la partagez jamais, même à des amis." },
  { id: 6, title: "Ponctualité", text: "Arrivez à l'heure indiquée. Un retard perturbe l'organisation de l'hôte et la vibe du groupe." },
  { id: 7, title: "Zéro drogue", text: "La possession ou consommation de substances illicites est strictement interdite sous peine d'exclusion." },
  { id: 8, title: "Respect du voisinage", text: "Soyez discret en arrivant et en partant. On préserve la tranquillité du quartier de l'hôte." },
  { id: 9, title: "Profil authentique", text: "Votre photo de profil doit être une vraie photo de vous. La transparence est la base de la confiance." },
  { id: 10, title: "Communication via l'app", text: "Privilégiez le chat GetVib pour votre sécurité. N'échangez vos numéros qu'une fois sur place." },
  { id: 11, title: "Contribution juste", text: "Pour les Vib+, réglez votre participation dès votre arrivée. C'est un gage de respect pour l'hôte." },
  { id: 12, title: "Pas de démarchage", text: "GetVib est un lieu de rencontre amicale, pas un lieu de prospection commerciale ou politique." },
  { id: 13, title: "Esprit communautaire", text: "Signalez tout problème via le chat de support. Protéger GetVib, c'est protéger vos prochaines soirées." },
  { id: 14, title: "Respect des lieux", text: "Traitez la maison de l'hôte avec soin. Laissez l'endroit aussi propre que vous l'avez trouvé." },
  { id: 15, title: "Consommation responsable", text: "L'alcool doit rester un plaisir. L'ivresse manifeste n'est jamais acceptée en soirée." },
  { id: 16, title: "Pas d'invités surprise", text: "Seuls les profils acceptés sur l'app sont autorisés. Ne venez jamais accompagné d'un inconnu." },
  { id: 17, title: "Droit de l'hôte", text: "L'hôte est souverain chez lui. S'il vous demande de partir, vous devez le faire sans discussion." },
  { id: 18, title: "Hygiène et tenue", text: "Venez avec une tenue propre et adaptée à la soirée. Le respect commence par l'image que l'on renvoie." },
];

export default function SafetyPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold">
          <Star className="h-4 w-4 fill-accent" />
          Charte de Confiance
        </div>
        <h1 className="text-5xl font-black tracking-tight italic uppercase text-white">Les 18 Commandements</h1>
        <p className="max-w-2xl mx-auto text-muted text-lg">
          Pour que chaque soirée reste un moment magique, sécurisé et respectueux. Voici les règles d'or de la communauté GetVib.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {commandements.map((item) => (
          <Card key={item.id} className="p-6 border-white/5 bg-slate-900/50 hover:border-accent/40 transition-colors relative overflow-hidden group">
            <span className="absolute -top-2 -right-2 text-6xl font-black text-white/5 group-hover:text-accent/10 transition-colors italic">
              {item.id}
            </span>
            <div className="relative z-10">
              <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent mb-4 font-black">
                {item.id}
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{item.text}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 border-red-500/20 bg-red-500/5 mt-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="h-16 w-16 shrink-0 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">Zéro tolérance</h2>
            <p className="mt-2 text-muted leading-relaxed">
              Le non-respect de ces commandements entraîne une <strong>suspension immédiate et définitive</strong> du compte. 
              La sécurité et la "vibe" de nos membres sont notre priorité absolue.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
