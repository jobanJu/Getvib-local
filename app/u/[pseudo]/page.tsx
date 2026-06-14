import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck, Users, CalendarDays, ArrowLeft, Handshake, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPublicProfile } from "@/features/events/server";
import { BadgeCollection } from "@/components/profile/badge-collection";
import { FriendActionButton } from "@/features/friends/friend-action-button";
import { ReportButton } from "@/features/moderation/report-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ pseudo: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { pseudo } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const data = await getPublicProfile(decodeURIComponent(pseudo), user?.id);
  if (!data) notFound();

  const { profile, stats, status, commonFriends, hostedEvents } = data;
  const verified = (profile.verification_level ?? 0) > 0;
  const interests: string[] = profile.interests || [];

  return (
    <section className="mx-auto grid max-w-2xl gap-6 px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      <Link href="/amis" className="flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <Card className="p-6">
        <div className="flex items-start gap-4">
          {profile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photo_url} alt={profile.name || ""} className="h-20 w-20 rounded-full border-2 border-accent object-cover" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-accent/20 text-2xl font-black text-accent">
              {(profile.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">{profile.name || "Membre Vib"}</h1>
              {verified && (
                <Badge tone="green"><ShieldCheck className="mr-1 h-3.5 w-3.5" />Le Jeune · Vérifié</Badge>
              )}
            </div>
            {profile.pseudo && <p className="text-sm font-semibold text-accent">@{profile.pseudo}</p>}
            {profile.city && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <MapPin className="h-3.5 w-3.5" /> {profile.city}
              </p>
            )}
          </div>
        </div>

        {profile.bio && <p className="mt-4 text-sm leading-relaxed text-muted">{profile.bio}</p>}

        {interests.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {interests.map((i) => (
              <Badge key={i}>{i}</Badge>
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-foreground/5 p-3">
            <p className="flex items-center justify-center gap-1 text-lg font-black"><CalendarDays className="h-4 w-4 text-accent" />{stats.eventsHosted}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted">Vibes</p>
          </div>
          <div className="rounded-2xl bg-foreground/5 p-3">
            <p className="flex items-center justify-center gap-1 text-lg font-black"><Users className="h-4 w-4 text-accent" />{stats.totalGuests}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted">Invités</p>
          </div>
          <div className="rounded-2xl bg-foreground/5 p-3">
            <p className="text-lg font-black">{stats.friends}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted">Amis</p>
          </div>
        </div>

        {status !== "self" && user && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <FriendActionButton targetId={profile.id} initialStatus={status as "none" | "friends" | "sent" | "received"} />
            <ReportButton targetUserId={profile.id} targetName={profile.name || undefined} />
          </div>
        )}
        {!user && (
          <Link href="/login" className="mt-5 inline-block font-semibold text-accent hover:underline">
            Connecte-toi pour ajouter {profile.name?.split(" ")[0] || "ce membre"} →
          </Link>
        )}
      </Card>

      {/* Amis communs */}
      {commonFriends.length > 0 && (
        <div className="grid gap-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <Handshake className="h-4 w-4 text-accent" />
                {commonFriends.length} ami{commonFriends.length > 1 ? "s" : ""} en commun
            </h3>
            <div className="flex -space-x-3 overflow-hidden p-1">
                {commonFriends.map((f) => (
                    <Link key={f.id} href={`/u/${f.pseudo}`} title={f.name}>
                        {f.photo_url ? (
                            <div className="relative inline-block h-10 w-10 overflow-hidden rounded-full ring-2 ring-background hover:scale-110 transition-transform">
                                <Image src={f.photo_url} alt="" fill className="object-cover" unoptimized />
                            </div>
                        ) : (
                            <div className="inline-block h-10 w-10 rounded-full bg-accent/20 ring-2 ring-background flex items-center justify-center text-accent font-bold text-xs">
                                {f.name?.charAt(0)}
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
      )}

      {/* Soirées organisées */}
      {hostedEvents.length > 0 && (
          <div className="grid gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Vibes organisées
              </h3>
              <div className="grid gap-2">
                  {hostedEvents.map((e) => (
                      <Link key={e.id} href={`/event/${e.id}`}>
                        <Card className="flex items-center gap-3 p-2.5 hover:bg-foreground/5 transition-colors border-foreground/5 overflow-hidden">
                            <div className="relative h-12 w-16 overflow-hidden rounded-lg shrink-0">
                                <Image src={e.image} alt="" fill className="object-cover" unoptimized />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{e.title}</p>
                                <p className="text-[10px] text-muted uppercase font-black">{e.city}</p>
                            </div>
                        </Card>
                      </Link>
                  ))}
              </div>
          </div>
      )}

      <BadgeCollection stats={stats} />
    </section>
  );
}
