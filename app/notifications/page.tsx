import { Bell, CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const notifications = [
  { title: "Candidature acceptée", text: "Tu rejoins Jazz, vinyles et planches.", icon: CheckCircle2 },
  { title: "Nouveau message", text: "L’hôte vient de t’écrire.", icon: MessageCircle },
  { title: "Adresse bientôt révélée", text: "La fenêtre de révélation approche.", icon: MapPin },
];

export default function NotificationsPage() {
  return (
    <section className="mx-auto grid max-w-3xl gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <p className="font-semibold text-accent-secondary">Centre d’activité</p>
        <h1 className="mt-2 text-4xl font-black">Notifications</h1>
      </div>
      {notifications.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="flex gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/18">
              <Icon className="h-5 w-5 text-accent-secondary" />
            </span>
            <div>
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          </Card>
        );
      })}
      <Card className="flex gap-4 p-4 text-muted">
        <Bell className="h-5 w-5 text-accent-secondary" />
        Les notifications push FCM sont activées dès que les clés Firebase sont configurées.
      </Card>
    </section>
  );
}
