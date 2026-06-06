import Image from "next/image";
import { Flag, ShieldCheck, Star, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const profileStats = [
  { label: "Soirées créées", value: "3", icon: Star },
  { label: "Soirées rejointes", value: "8", icon: UsersRound },
  { label: "Vérification", value: "Téléphone", icon: ShieldCheck },
];

export default function ProfilePage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.7fr_1fr] lg:px-8">
      <Card className="overflow-hidden">
        <div className="relative h-36 bg-accent/30" />
        <div className="p-5">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
            alt=""
            width={96}
            height={96}
            className="-mt-16 h-24 w-24 rounded-2xl border-4 border-background object-cover"
          />
          <h1 className="mt-4 text-3xl font-black">Camille</h1>
          <p className="mt-2 text-muted">28 ans · Lille · Jazz, food, cinéma</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="green">Niveau 1</Badge>
            <Badge>Profil public</Badge>
          </div>
          <Button className="mt-5 w-full" variant="danger">
            <Flag className="h-4 w-4" />
            Signaler
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Bio</h2>
          <p className="mt-3 leading-7 text-muted">J’aime les soirées simples, les bonnes playlists et les discussions qui prennent le temps.</p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-3">
          {profileStats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-5">
              <Icon className="h-5 w-5 text-accent-secondary" />
              <p className="mt-4 text-2xl font-black">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
