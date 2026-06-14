import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireAdminPage } from "@/lib/admin";
import { getGrantedConversation } from "@/features/admin/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ chatId: string }> };

export default async function AdminConversationPage({ params }: Props) {
  await requireAdminPage();
  const { chatId } = await params;

  const convo = await getGrantedConversation(chatId);

  return (
    <section className="mx-auto grid max-w-2xl gap-4 px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      <Link href="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour au back-office
      </Link>

      {!convo ? (
        <Card className="p-8 text-center">
          <p className="font-bold text-foreground">Accès non autorisé</p>
          <p className="mt-1 text-sm text-muted">
            Aucun consentement valide pour cette conversation. Tu ne peux la consulter que si le signaleur a accordé l&#39;accès.
          </p>
        </Card>
      ) : (
        <>
          <Card className="flex items-center gap-2 border-emerald-400/30 bg-emerald-400/5 p-3 text-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Accès accordé par consentement · {convo.participants.map((p) => p?.name).filter(Boolean).join(" ↔ ")}</span>
          </Card>

          <Card className="grid gap-3 p-4">
            {convo.messages.length === 0 ? (
              <p className="text-sm italic text-muted">Aucun message dans cette conversation.</p>
            ) : (
              convo.messages.map((m) => (
                <div key={m.id} className="border-b border-foreground/5 pb-2 last:border-0">
                  <p className="text-xs font-bold text-accent">
                    {m.sender?.name || "?"} {m.sender?.pseudo ? `@${m.sender.pseudo}` : ""}
                    <span className="ml-2 font-normal text-muted">
                      {new Date(m.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </p>
                  <p className="text-sm text-foreground">{m.text}</p>
                </div>
              ))
            )}
          </Card>
        </>
      )}
    </section>
  );
}
