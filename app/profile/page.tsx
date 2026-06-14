import Link from "next/link";
import { redirect } from "next/navigation";
import { History, Calendar, MapPin, Pencil, Plus, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { 
  listEventsAttending, 
  listEventsByHost, 
  listPendingApplicationsForHost,
  listPastEventsAttending,
  listFriends,
  listPendingFriendRequests
} from "@/features/events/server";
import { formatEventDate } from "@/lib/date";
import { ApplicationManager } from "@/features/events/application-manager";
import { LeaveEventButton } from "@/components/events/leave-event-button";
import { FriendRequestManager } from "@/features/profile/friend-request-manager";
import { FriendList } from "@/features/profile/friend-list";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, { label: string; tone: "green" | "neutral" | "red" | "amber" }> = {
  published: { label: "En ligne", tone: "green" },
  draft: { label: "Brouillon", tone: "neutral" },
  cancelled: { label: "Annulée", tone: "red" },
  completed: { label: "Terminée", tone: "amber" },
};

function memberSince(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const events = await listEventsByHost(user.id);
  const attending = await listEventsAttending(user.id);
  const pastEvents = await listPastEventsAttending(user.id);
  const pendingApplications = await listPendingApplicationsForHost(user.id);
  const friends = await listFriends(user.id);
  const friendRequests = await listPendingFriendRequests(user.id);

  const name = profile?.name || user.user_metadata?.display_name || "Explorateur Vib";
  const verification = profile?.verification_level ?? 0;
  const interests: string[] = profile?.interests || [];
  const guests = events.reduce((sum, e) => sum + e.participants.length, 0);

  const stats = [
    { value: events.length, label: "Soirées" },
    { value: guests, label: "Invités" },
    { value: `Niv. ${verification}`, label: "Vérif." },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* En-tête profil */}
      <Card className="mb-6 overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-r from-accent/50 via-accent-secondary/30 to-transparent" />
        <div className="px-6 pb-6">
          <div className="-mt-12 mb-4 flex items-end justify-between">
            {profile?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photo_url}
                alt={name}
                className="h-24 w-24 rounded-full border-4 border-background object-cover ring-2 ring-accent shadow-[0_0_30px_rgba(246,51,154,0.5)]"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-background bg-accent text-3xl font-black text-foreground ring-2 ring-accent shadow-[0_0_30px_rgba(246,51,154,0.5)]">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <Button variant="secondary" size="sm" asChild className="mb-1">
              <Link href="/settings"><Pencil className="mr-1 h-4 w-4" />Modifier</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">{name}</h1>
            {verification > 0 ? (
              <Badge tone="green"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Vérifié niveau {verification}</Badge>
            ) : (
              <Badge tone="neutral">Non vérifié</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">{user.email} · membre depuis {memberSince(profile?.created_at)}</p>

          {profile?.bio ? (
            <p className="mt-3 max-w-prose text-sm leading-6 text-muted">{profile.bio}</p>
          ) : (
            <Link href="/settings" className="mt-3 inline-block text-sm font-semibold text-accent-secondary hover:underline">
              + Ajouter une bio
            </Link>
          )}

          {interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest} tone="purple">{interest}</Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-foreground/10 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5">
            {stats.map((s) => (
              <div key={s.label} className="px-3 py-4 text-center">
                <p className="text-xl font-black text-foreground">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Gestion des candidatures */}
      <ApplicationManager initialApplications={pendingApplications} />

      {/* Gestion des amis */}
      <FriendRequestManager initialRequests={friendRequests} />

      {/* Mes amis */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Users className="h-5 w-5 text-accent" />
          Mes amis
          <span className="text-base font-normal text-muted">({friends.length})</span>
        </h2>
      </div>
      <div className="mb-10">
        <FriendList friends={friends} />
      </div>

      {/* Mes participations */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-5 w-5 text-accent" />
          Mes participations
          <span className="text-base font-normal text-muted">({attending.length})</span>
        </h2>
      </div>

      {attending.length === 0 ? (
        <Card className="mb-10 border-2 border-dashed p-6 text-center">
          <p className="text-sm italic text-muted">Vous n&#39;avez pas de participation prévue.</p>
          <Button variant="secondary" size="sm" asChild className="mt-4">
            <Link href="/discover">Découvrir des vibes</Link>
          </Button>
        </Card>
      ) : (
        <div className="mb-10 grid gap-3">
          {attending.map((event) => (
            <Card key={event.id} className="flex gap-4 p-3 border-emerald-500/10 bg-emerald-500/5">
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-lg font-semibold">{event.title}</h3>
                    <Badge tone="green">Confirmé</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-accent-secondary" />
                      {formatEventDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1.5 text-foreground font-medium">
                      <MapPin className="h-4 w-4 text-emerald-400" />
                      {event.city}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/event/${event.id}`}>Détails</Link>
                  </Button>
                  <LeaveEventButton eventId={event.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Mes soirées */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Calendar className="h-5 w-5 text-accent" />
          Mes soirées
          <span className="text-base font-normal text-muted">({events.length})</span>
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/create"><Plus className="mr-1 h-4 w-4" />Créer</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-2 border-dashed p-10 text-center">
          <p className="text-sm italic text-muted">Vous n&#39;avez pas encore organisé de soirée.</p>
          <Button asChild className="mt-4">
            <Link href="/create">Organiser ma première vibe</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {events.map((event) => {
            const badge = statusBadge[event.status] ?? statusBadge.draft;
            return (
              <Card key={event.id} className="flex gap-4 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image}
                  alt=""
                  className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-lg font-semibold">{event.title}</h3>
                      <Badge tone={badge.tone}>{badge.label}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-accent-secondary" />
                        {formatEventDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-accent-secondary" />
                        {event.city}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-accent-secondary" />
                        {event.participants.length}/{event.maxParticipants}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/event/${event.id}/manage`}>Gérer</Link>
                    </Button>
                    <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Historique */}
      {pastEvents.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <History className="h-5 w-5 text-muted" />
            Historique
            <span className="text-base font-normal text-muted">({pastEvents.length})</span>
          </h2>
          <div className="grid gap-3 opacity-60">
            {pastEvents.map((event) => (
              <Card key={event.id} className="flex gap-4 p-3 bg-foreground/5">
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold">{event.title}</h3>
                    <div className="mt-1 flex gap-4 text-xs text-muted">
                      <span>{formatEventDate(event.date)}</span>
                      <span>{event.city}</span>
                    </div>
                  </div>
                  <Badge tone="neutral">Passée</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <SignOutButton className="mt-8 w-full text-red-400 border-red-400/20 hover:bg-red-400/10 sm:w-auto" />
    </section>
  );
}
