import { Bell, LockKeyhole, Smartphone, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";

const settings = [
  { title: "Compte", text: "Nom, photo, bio et centres d&#39;intérêt.", icon: UserRound },
  { title: "Confidentialité", text: "Adresse privée et visibilité du profil.", icon: LockKeyhole },
  { title: "Notifications", text: "Messages, candidatures et rappels.", icon: Bell },
  { title: "PWA", text: "Installation mobile, splash screen et mode standalone.", icon: Smartphone },
];

export default function SettingsPage() {
  return (
    <section className="mx-auto grid max-w-4xl gap-4 px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-black">Paramètres</h1>
      {settings.map(({ title, text, icon: Icon }) => (
        <Card key={title} className="flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/8">
            <Icon className="h-5 w-5 text-accent-secondary" />
          </span>
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        </Card>
      ))}
    </section>
  );
}
