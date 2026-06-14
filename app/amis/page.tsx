import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, UserPlus, CalendarDays, MapPin, Sparkles, MessageSquareQuote, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { listFriends, listPendingFriendRequests, listFriendsVibes, listRecentFriendsReviews } from "@/features/events/server";
import { formatEventDate } from "@/lib/date";
import { Stars } from "@/components/reviews/stars";
import { FriendRequestManager } from "@/features/profile/friend-request-manager";
import { FriendList } from "@/features/profile/friend-list";
import { AddFriend } from "@/features/friends/add-friend";

export const dynamic = "force-dynamic";

export const metadata = { title: "Amis · GetVib" };

export default async function AmisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const friends = await listFriends(user.id);
  const friendRequests = await listPendingFriendRequests(user.id);
  const friendsVibes = await listFriendsVibes(user.id);
  const friendsReviews = await listRecentFriendsReviews(user.id);

  return (
    <section className="mx-auto grid max-w-2xl gap-8 px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight">
          <Users className="h-7 w-7 text-accent" />
          Mes amis
        </h1>
        <p className="text-muted">Retrouve tes amis, vois où ils sortent et agrandis ta bande.</p>
      </div>

      {/* Ajouter un ami par @pseudo */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <UserPlus className="h-5 w-5 text-accent" />
          Ajouter un ami
        </h2>
        <AddFriend />
      </div>

      {/* Demandes reçues */}
      <FriendRequestManager initialRequests={friendRequests} />

      {/* Où sortent mes amis */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Sparkles className="h-5 w-5 text-accent" />
          Où sortent mes amis
        </h2>
        {friendsVibes.length === 0 ? (
          <Card className="border-2 border-dashed p-8 text-center">
            <p className="text-sm italic text-muted">
              Aucun ami inscrit à une vibe pour le moment. Explore les soirées et propose-leur !
            </p>
            <Link href="/discover" className="mt-3 inline-block font-semibold text-accent hover:underline">
              Découvrir les vibes →
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {friendsVibes.map((v) => (
              <Link key={v.eventId} href={`/event/${v.eventId}`}>
                <Card className="flex gap-3 overflow-hidden p-3 transition hover:border-accent/40">
                  {v.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{v.title}</p>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3 text-accent-secondary" /> {formatEventDate(v.date)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-accent-secondary" /> {v.city}</span>
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {v.friendsGoing.slice(0, 4).map((f) =>
                          f.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={f.id} src={f.photo_url} alt="" className="h-6 w-6 rounded-full border-2 border-card object-cover" />
                          ) : (
                            <div key={f.id} className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-accent/20 text-[10px] font-bold text-accent">
                              {(f.name || "?").charAt(0).toUpperCase()}
                            </div>
                          ),
                        )}
                      </div>
                      <p className="truncate text-xs text-muted">
                        {v.friendsGoing.map((f) => f.name?.split(" ")[0]).filter(Boolean).join(", ")} y {v.friendsGoing.length > 1 ? "vont" : "va"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Derniers avis de mes amis */}
      {friendsReviews.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <MessageSquareQuote className="h-5 w-5 text-accent" />
            Derniers avis de tes amis
          </h2>
          <div className="grid gap-2">
            {friendsReviews.map((r) => (
              <Card key={r.id} className="flex gap-3 p-3">
                {r.author?.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.author.photo_url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-accent">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="font-bold">{r.author?.name?.split(" ")[0] || "Un ami"}</span>
                    <Stars value={r.rating} className="h-3.5 w-3.5" />
                  </p>
                  {r.event?.title && (
                    <Link href={`/event/${r.event.id}`} className="text-xs font-semibold text-accent hover:underline">
                      {r.event.title}
                    </Link>
                  )}
                  {r.comment && <p className="mt-0.5 truncate text-sm text-muted">{r.comment}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ma liste d'amis */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Users className="h-5 w-5 text-accent" />
          Ma bande <span className="text-base font-normal text-muted">({friends.length})</span>
        </h2>
        <FriendList friends={friends} />
      </div>
    </section>
  );
}
