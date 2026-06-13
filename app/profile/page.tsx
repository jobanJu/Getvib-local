import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, MapPin, Plus, Settings, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { listEventsByHost } from "@/features/events/server";
import { formatEventDate } from "@/lib/date";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, { label: string; tone: "green" | "neutral" | "red" | "amber" }> = {
  published: { label: "En ligne", tone: "green" },
  draft: { label: "Brouillon", tone: "neutral" },
  cancelled: { label: "Annulée", tone: "red" },
  completed: { label: "Terminée", tone: "amber" },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const events = await listEventsByHost(user.id);

  const name = profile?.name || user.user_metadata?.display_name || "Explorateur Vib";
  const verification = profile?.verification_level ?? 0;
  const interests: string[] = profile?.interests || [];

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight">Profil</h1>
        <Button variant="secondary" size="icon" asChild>
          <Link href="/settings"><Settings className="h-5 w-5" /></Link>
        </Button>
      </div>

      <Card className="mb-6 p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          {profile?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photo_url}
              alt={name}
              className="h-24 w-24 rounded-full object-cover border-4 border-accent"
            />
          ) : (
            <div className="grid h-24 w-24 place-items-center rounded-full bg-accent text-3xl font-black text-white">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-2xl font-bold">{name}</h2>
              {verification > 0 ? (
                <Badge tone="green"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Vérifié niveau {verification}</Badge>
              ) : (
                <Badge tone="neutral">Non vérifié</Badge>
              )}
            </div>
            <p className="text-sm text-muted">{user.email}</p>
            {profile?.bio ? (
              <p className="max-w-prose text-sm leading-6 text-muted">{profile.bio}</p>
            ) : (
              <Link href="/settings" className="text-sm font-semibold text-accent-secondary hover:underline">
                Ajouter une bio →
              </Link>
            )}
          </div>
        </div>

        {interests.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {interests.map((interest) => (
              <Badge key={interest} tone="purple">{interest}</Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Calendar className="h-5 w-5 text-accent" />
            Mes soirées
            <span className="text-base font-normal text-muted">({events.length})</span>
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/create"><Plus className="mr-1 h-4 w-4" />Créer</Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <Card className="border-2 border-dashed p-8 text-center">
            <p className="text-sm italic text-muted">Vous n&#39;avez pas encore organisé de soirée.</p>
            <Button asChild variant="ghost" className="mt-2">
              <Link href="/create">Organiser ma première vibe</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3">
            {events.map((event) => {
              const badge = statusBadge[event.status] ?? statusBadge.draft;
              return (
                <Card key={event.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-lg font-semibold">{event.title}</h4>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <div className="mt-2 grid gap-1 text-sm text-muted">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent-secondary" />
                        {formatEventDate(event.date)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent-secondary" />
                        {event.city}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-accent-secondary" />
                        {event.participants.length}/{event.maxParticipants} invités
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/event/${event.id}`}>Voir</Link>
                    </Button>
                    <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <SignOutButton className="mt-6 text-red-400 border-red-400/20 hover:bg-red-400/10" />
      </div>
    </section>
  );
}
