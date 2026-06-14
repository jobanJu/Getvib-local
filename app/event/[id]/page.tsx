import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, LockKeyhole, MapPin, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VibBadge } from "@/components/events/vib-badge";
import { cn } from "@/lib/utils";
import { getEventForViewer, listEventReviews, reviewStats, canReviewEvent } from "@/features/events/server";
import { formatEventDate } from "@/lib/date";
import { ApplicationForm } from "@/features/events/application-form";
import { EventReviews } from "@/features/events/event-reviews";
import { Countdown } from "@/components/ui/countdown";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const event = await getEventForViewer(id, user?.id);

  if (!event) notFound();

  const isParticipant = Boolean(user && event.participants.includes(user.id));
  const showCountdown = isParticipant && !event.addressVisible && new Date(event.revealAt).getTime() > Date.now();

  // Avis : visibles par tous ; le formulaire n'apparaît que si l'utilisateur a
  // participé à cette vibe (passée) et n'a pas encore donné son ressenti.
  const reviews = await listEventReviews(id);
  const { average } = reviewStats(reviews);
  const canReview = user ? (await canReviewEvent(user.id, id)).can : false;

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.7fr] lg:px-8">
      <div className="grid gap-5">
        <div
          className={cn(
            "relative aspect-[16/10] overflow-hidden rounded-3xl border",
            event.type === "vibplus"
              ? "border-accent/50 ring-1 ring-accent/40 shadow-[0_0_40px_rgba(246,51,154,0.22)]"
              : "border-border",
          )}
        >
          <Image src={event.image} alt="" fill unoptimized className="object-cover" sizes="(max-width: 1024px) 100vw, 680px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-3 flex gap-2">
              <VibBadge type={event.type} />
              <Badge>{event.vibe}</Badge>
            </div>
            <h1 className="text-4xl font-black leading-tight">{event.title}</h1>
          </div>
        </div>

        <Card className="p-5">
          <h2 className="text-xl font-semibold">Ambiance</h2>
          <p className="mt-3 leading-7 text-muted">{event.description}</p>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold">Sécurité et adresse</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <span className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-accent-secondary" />
              Zone publique: {event.city}
            </span>
            {event.addressVisible ? (
              <span className="flex items-center gap-3 text-foreground font-medium">
                <MapPin className="h-5 w-5 text-emerald-400" />
                {event.address}
              </span>
            ) : (
              <div className="grid gap-3">
                <span className="flex items-center gap-3">
                  <LockKeyhole className="h-5 w-5 text-accent-secondary" />
                  {event.addressHint}
                </span>
                {showCountdown && <Countdown targetDate={event.revealAt} />}
              </div>
            )}
            <span className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent-secondary" />
              Hôte vérifié niveau 1 minimum recommandé.
            </span>
          </div>
        </Card>

        <EventReviews eventId={id} reviews={reviews} canReview={canReview} average={average} />
      </div>

      <aside className="grid gap-4 self-start lg:sticky lg:top-24">
        <Card className="p-5">
          <div className="grid gap-3 text-sm text-muted">
            <span className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-accent-secondary" />
              {formatEventDate(event.date)}
            </span>
            <span className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent-secondary" />
              {event.participants.length}/{event.maxParticipants} invités
            </span>
            <span className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-accent-secondary" />
              {event.city}
            </span>
          </div>
          <div className="mt-5 rounded-2xl border border-foreground/10 bg-foreground/8 p-4">
            <p className="text-sm font-semibold text-foreground">{event.contributionAmount > 0 ? `${event.contributionAmount} €` : "Gratuit"}</p>
            <p className="mt-1 text-sm text-muted">{event.type === "vibplus" ? "Participation possible, justifiée par l’hôte." : "Vib ouvert à tous."}</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-semibold mb-4">Rejoindre la vibe</h2>
          {user?.id === event.hostId ? (
            <div className="grid gap-2">
                <Button className="w-full bg-accent text-foreground font-bold py-6" asChild>
                    <Link href={`/event/${id}/manage`}>Gérer cette vibe</Link>
                </Button>
                <p className="text-[10px] text-center text-muted uppercase font-bold tracking-widest">
                    Vous êtes l&#39;hôte de cette vibe
                </p>
            </div>
          ) : (
            <ApplicationForm eventId={id} />
          )}
        </Card>
      </aside>
    </section>
  );
}
