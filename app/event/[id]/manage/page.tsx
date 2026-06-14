import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageCircle, Settings, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEventManagementData } from "@/features/events/server";
import { createClient } from "@/lib/supabase/server";
import { ApplicationManager } from "@/features/events/application-manager";
import { ParticipantList } from "@/features/events/participant-list";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EventManagePage({ params }: Props) {
  const { id: eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  try {
    const { event, participants, applications } = await getEventManagementData(eventId, user.id);

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/event/${eventId}`} className="flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Retour à la soirée
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
                <Link href="/messages" className="gap-2">
                    <MessageCircle className="h-4 w-4" /> Chat de groupe
                </Link>
            </Button>
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2">{event.title}</h1>
          <p className="text-muted flex items-center gap-2">
            Tableau de bord de l&#39;hôte 
            <Badge tone="purple" className="rounded-full">Hôte</Badge>
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* 1. Candidatures */}
            <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-accent">
                    <UserPlus className="h-5 w-5" />
                    Candidatures en attente ({applications.length})
                </h2>
                {applications.length > 0 ? (
                    <ApplicationManager initialApplications={applications} />
                ) : (
                    <div className="p-8 border-2 border-dashed rounded-2xl text-center text-sm text-muted italic bg-foreground/5">
                        Aucune nouvelle candidature pour le moment.
                    </div>
                )}
            </section>

            {/* 2. Participants */}
            <section>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-emerald-400">
                    <Users className="h-5 w-5" />
                    Liste des invités ({participants.length}/{event.maxParticipants})
                </h2>
                <ParticipantList eventId={eventId} initialParticipants={participants} />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                    <Settings className="h-4 w-4 text-muted" />
                    Actions rapides
                </h3>
                <div className="grid gap-2">
                    <Button variant="secondary" className="w-full justify-start text-muted opacity-50 cursor-not-allowed">
                        Modifier les infos (Bientôt)
                    </Button>
                    <Button variant="secondary" className="w-full justify-start text-muted opacity-50 cursor-not-allowed">
                        Annuler la soirée
                    </Button>
                </div>
                <p className="mt-4 text-[10px] text-muted uppercase font-bold tracking-widest leading-relaxed">
                    L&#39;adresse sera automatiquement révélée aux invités acceptés 2h avant le début.
                </p>
            </div>
          </aside>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Management page error:", error);
    notFound();
  }
}
