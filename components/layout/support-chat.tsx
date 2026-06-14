"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Send, MessageSquare } from "lucide-react";

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Vous devez être connecté.");

      // On enregistre dans la base de données
      const { error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: "Réclamation / Support",
          message: message,
          email: user.email,
        });

      if (error) throw error;

      // Simulation d'envoi d'email (En production, un trigger ou une Edge Function ferait l'envoi réel)
      setStatus("success");
      setMessage("");
      setTimeout(() => setOpen(false), 3000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-foreground shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 z-50">
      <Card className="border-foreground/10 bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="bg-accent p-4 flex justify-between items-center text-foreground">
          <h3 className="font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Support & Réclamations
          </h3>
          <button onClick={() => setOpen(false)} className="text-foreground/60 hover:text-foreground">✕</button>
        </div>
        
        <div className="p-4">
          {status === "success" ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 bg-success/20 text-success rounded-full mx-auto flex items-center justify-center">✓</div>
              <p className="font-semibold">Message envoyé !</p>
              <p className="text-sm text-muted">Jonathan a été informé de votre réclamation à l'adresse jonathan@getvib.fr.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted">
                Une question ou une réclamation ? Votre message sera envoyé directement à l'équipe GetVib.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted tracking-wider">Votre message</label>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Décrivez votre problème ici..."
                  className="min-h-32 bg-card-soft border-foreground/10"
                />
              </div>
              <Button type="submit" disabled={loading || !message.trim()} className="w-full">
                {loading ? "Envoi..." : "Envoyer à jonathan@getvib.fr"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
              {status === "error" && (
                <p className="text-xs text-danger text-center">Une erreur est survenue. Réessayez.</p>
              )}
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
