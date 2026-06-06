import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const conversations = [
  { id: "1", title: "Hôte - Jazz, vinyles et planches", last: "Merci pour ta candidature, on échange ici." },
  { id: "2", title: "Groupe - Jeux de société chill", last: "Qui apporte un jeu rapide pour commencer ?" },
];

export default function MessagesPage() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[22rem_1fr] lg:px-8">
      <div className="grid gap-3">
        <h1 className="text-4xl font-black">Messages</h1>
        {conversations.map((conversation) => (
          <Card key={conversation.id} className="p-4">
            <h2 className="font-semibold">{conversation.title}</h2>
            <p className="mt-1 text-sm text-muted">{conversation.last}</p>
          </Card>
        ))}
      </div>
      <Card className="grid min-h-[70vh] grid-rows-[1fr_auto] overflow-hidden">
        <div className="grid content-end gap-3 p-4">
          <div className="max-w-[82%] rounded-2xl bg-white/8 p-3 text-sm text-muted">Hello, ravi de découvrir la vibe de la soirée.</div>
          <div className="ml-auto max-w-[82%] rounded-2xl bg-accent p-3 text-sm">Merci, ton profil colle bien à l’ambiance.</div>
        </div>
        <form className="flex gap-2 border-t border-border p-3">
          <Input placeholder="Écrire un message" />
          <Button size="icon" aria-label="Envoyer">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </Card>
    </section>
  );
}
