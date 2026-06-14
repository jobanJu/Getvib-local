"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const SUPPORT_EMAIL = "jonathan@getvib.fr";

// Panneau de réclamation / support, affiché INLINE dans la page /aide (plus de
// bulle flottante qui masquait la navigation mobile). Membres Vib+++ : chat
// prioritaire en direct ; autres : e-mail (mailto, zéro outil tiers, réponse 12h).
export function SupportPanel() {
  const router = useRouter();
  const supabase = createClient();

  const [premium, setPremium] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single();
      setPremium(!!data?.is_premium);
    })();
  }, [supabase]);

  function sendMail(e: React.FormEvent) {
    e.preventDefault();
    // Enregistre le ticket côté serveur pour le suivi admin (best-effort, sans
    // bloquer), puis ouvre la messagerie de la personne.
    fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message }),
    }).catch(() => {});

    const subject = encodeURIComponent("Réclamation / Support GetVib");
    const body = encodeURIComponent(`${message}\n\n— Envoyé depuis ${email}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
    setEmail("");
    setMessage("");
  }

  async function openPriorityChat() {
    setChatLoading(true);
    setChatError(null);
    try {
      const res = await fetch("/api/support/priority-chat", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Chat indisponible.");
      router.push(json.chatId ? `/messages?chat=${json.chatId}` : "/messages");
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Chat indisponible.");
    } finally {
      setChatLoading(false);
    }
  }

  if (premium) {
    return (
      <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-accent-secondary/10 p-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Chat prioritaire Vib+++</h2>
        <p className="mt-1 text-sm text-muted">En tant que membre Vib+++, discute en direct avec notre équipe.</p>
        <Button onClick={openPriorityChat} loading={chatLoading} className="mt-4 w-full sm:w-auto">
          <MessageCircle className="h-4 w-4" />
          Ouvrir le chat prioritaire
        </Button>
        {chatError && <p className="mt-2 text-sm text-danger">{chatError}</p>}
      </Card>
    );
  }

  return (
    <Card className="border-accent/20 bg-accent/5 p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
          <Mail className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Toujours besoin d&#39;aide ?</h2>
          <p className="text-sm text-muted">Laisse ton e-mail et ton message, on te répond <strong>sous 12h</strong>.</p>
        </div>
      </div>

      {sent ? (
        <p className="rounded-xl bg-success/10 p-4 text-center text-sm font-semibold text-success">
          Ta messagerie s&#39;ouvre… Clique sur « Envoyer » pour transmettre ta réclamation. Réponse sous 12h.
        </p>
      ) : (
        <form onSubmit={sendMail} className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Ton e-mail
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="toi@exemple.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Ton message
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Décris ton problème ici..."
              className="min-h-28"
            />
          </label>
          <Button type="submit" disabled={!email.trim() || !message.trim()} className="w-full sm:w-auto sm:justify-self-start">
            Envoyer à {SUPPORT_EMAIL}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      )}
    </Card>
  );
}
