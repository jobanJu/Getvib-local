import { AlertTriangle, BadgeCheck, LockKeyhole, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const verificationLevels = [
  { title: "Niveau 0", text: "Email vérifié", icon: BadgeCheck },
  { title: "Niveau 1", text: "Téléphone vérifié", icon: ShieldCheck },
  { title: "Niveau 2", text: "Identité vérifiée", icon: LockKeyhole },
];

export default function SafetyPage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="font-semibold text-accent-secondary">Centre sécurité</p>
        <h1 className="mt-2 text-4xl font-black">Confiance, signalements et vérifications</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {verificationLevels.map(({ title, text, icon: Icon }) => (
          <Card key={title} className="p-5">
            <Icon className="h-6 w-6 text-accent-secondary" />
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{text}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <div className="flex gap-4">
          <AlertTriangle className="h-6 w-6 shrink-0 text-red-300" />
          <div>
            <h2 className="text-xl font-semibold">Signaler un comportement</h2>
            <p className="mt-2 leading-7 text-muted">
              Les signalements couvrent comportement dangereux, harcèlement, faux profil ou toute situation qui met en risque les invités.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
