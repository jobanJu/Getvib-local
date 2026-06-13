import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const vibes = ["Jazz", "Gastronomie", "Jeux de société", "Football", "Chill", "Gaming", "Musique", "Cinéma"];
const howItWorks = [
  { title: "Choisissez une vibe", text: "Jazz, food, gaming, chill ou cinéma: la soirée part d’un intérêt commun.", icon: Sparkles },
  { title: "Candidatez simplement", text: "L’hôte reçoit votre message et valide les invités qui matchent l’ambiance.", icon: HeartHandshake },
  { title: "Rencontrez en sécurité", text: "Adresse privée, signalements, vérifications et révélation encadrée.", icon: ShieldCheck },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2200&q=80"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#06060A_0%,rgba(6,6,10,0.82)_42%,rgba(6,6,10,0.36)_100%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl content-center px-4 pb-24 pt-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm font-semibold text-pink-100">
              Lancement MVP à Lille
            </p>
            <h1 className="text-5xl font-black leading-[0.96] tracking-tight sm:text-7xl">
              La soirée parfaite commence par la bonne vibe.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              Rencontrez des personnes qui partagent réellement vos passions autour de soirées privées sélectionnées.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Rejoindre GetVib <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/discover">Découvrir les vibes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-3">
          <p className="font-semibold text-accent-secondary">Comment ça marche</p>
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Moins de scroll, plus de vraies rencontres.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {howItWorks.map(({ title, text, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-6 w-6 text-accent-secondary" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted">{text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-accent-secondary">Découvrir des vibes</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Des cercles petits, intentionnels et chaleureux.</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/discover">Explorer Lille</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {vibes.map((vibe) => (
            <span key={vibe} className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold">
              {vibe}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <Card className="grid gap-8 p-6 md:grid-cols-[1fr_0.8fr] md:p-8">
          <div>
            <p className="font-semibold text-accent-secondary">Sécurité</p>
            <h2 className="mt-2 text-3xl font-bold">Pensé pour inspirer confiance dès la première soirée.</h2>
            <div className="mt-6 grid gap-3 text-sm text-muted">
              {["Adresse jamais publique", "Révélation 2h avant aux invités acceptés", "Badges de vérification", "Centre sécurité et signalements"].map((item) => (
                <span key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
            <UsersRound className="h-8 w-8 text-accent-secondary" />
            <p className="mt-4 text-4xl font-black">10</p>
            <p className="mt-2 text-muted">premiers utilisateurs réels à Lille pour valider le MVP.</p>
          </div>
        </Card>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">FAQ</h2>
        {[
          ["GetVib est-il un réseau social ?", "Non. GetVib privilégie les rencontres IRL en petit comité autour d’une vibe partagée."],
          ["Qui voit mon adresse ?", "Personne publiquement. Les invités acceptés la voient uniquement quand la révélation est due."],
          ["Quelle différence entre Vib et Vib+ ?", "Vib est gratuit et ouvert. Vib+ permet des critères stricts et une participation encadrée."],
        ].map(([question, answer]) => (
          <Card key={question} className="p-5">
            <h3 className="font-semibold">{question}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{answer}</p>
          </Card>
        ))}
        <div className="pt-6">
          <Button asChild size="lg">
            <Link href="/signup">Créer mon compte</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
