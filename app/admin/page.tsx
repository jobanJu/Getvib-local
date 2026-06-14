import { ShieldAlert, BadgeCheck, LifeBuoy, Users, MessageCircle, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requireAdminPage } from "@/lib/admin";
import Link from "next/link";
import {
  getAdminStats,
  listReports,
  listPendingVerifications,
  listSupportTickets,
  searchAdminProfiles,
  listAccessGrants,
} from "@/features/admin/server";
import { VerificationDecision, DismissReport, RequestMessageAccess, BanUserAction } from "@/features/admin/admin-actions";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · GetVib" };

function timeAgo(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminPage();
  const { q = "" } = await searchParams;

  const [stats, reports, verifications, tickets, users, grants] = await Promise.all([
    getAdminStats(),
    listReports(),
    listPendingVerifications(),
    listSupportTickets(),
    searchAdminProfiles(q),
    listAccessGrants().catch(() => []),
  ]);

  const cards = [
    { label: "Signalements", value: stats.reports, icon: Flag },
    { label: "Vérifs en attente", value: stats.verifications, icon: BadgeCheck },
    { label: "Tickets support", value: stats.tickets, icon: LifeBuoy },
    { label: "Membres", value: stats.users, icon: Users },
    { label: "Conversations", value: stats.chats, icon: MessageCircle },
  ];

  return (
    <section className="mx-auto grid max-w-4xl gap-8 px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-7 w-7 text-accent" />
        <h1 className="text-3xl font-black tracking-tight">Back-office</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 text-center">
            <c.icon className="mx-auto mb-1 h-5 w-5 text-accent" />
            <p className="text-2xl font-black">{c.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted">{c.label}</p>
          </Card>
        ))}
      </div>

      {/* Signalements */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Flag className="h-5 w-5 text-danger" />Signalements ({reports.length})</h2>
        {reports.length === 0 ? (
          <p className="text-sm italic text-muted">Aucun signalement. 🎉</p>
        ) : (
          <div className="grid gap-2">
            {reports.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm">
                      <span className="font-bold text-danger">{r.target?.name || "?"}</span>
                      {r.target?.pseudo && <span className="text-accent"> @{r.target.pseudo}</span>}
                      <span className="text-muted"> signalé par </span>
                      <span className="font-semibold">{r.reporter?.name || "?"}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">{r.reason}</p>
                    <p className="mt-1 text-[11px] text-muted">{timeAgo(r.created_at)}</p>
                    <div className="mt-2"><RequestMessageAccess reportId={r.id} /></div>
                  </div>
                  <DismissReport reportId={r.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accès aux conversations (consentements) */}
      {grants.length > 0 && (
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold">Accès aux conversations</h2>
          <p className="mb-3 text-xs text-muted">
            L&#39;accès n&#39;est possible que si le signaleur a <strong>explicitement consenti</strong>.
          </p>
          <div className="grid gap-2">
            {grants.map((g) => (
              <Card key={g.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold">{g.reporter?.name || "?"}</span>
                  <span className="text-muted"> · conversation avec {g.reported_name || "?"}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span
                    className={
                      g.status === "granted" ? "text-xs font-bold text-emerald-400"
                        : g.status === "denied" ? "text-xs font-bold text-danger"
                        : "text-xs font-bold text-muted"
                    }
                  >
                    {g.status === "granted" ? "Accordé" : g.status === "denied" ? "Refusé" : "En attente"}
                  </span>
                  {g.status === "granted" && g.chat_id && (
                    <Link href={`/admin/conversation/${g.chat_id}`} className="text-xs font-semibold text-accent hover:underline">
                      Voir →
                    </Link>
                  )}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vérifications */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><BadgeCheck className="h-5 w-5 text-accent" />Demandes de vérification ({verifications.length})</h2>
        {verifications.length === 0 ? (
          <p className="text-sm italic text-muted">Aucune demande en attente.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {verifications.map((v) => (
              <Card key={v.id} className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.photo_url} alt="" className="h-48 w-full object-cover" />
                <div className="p-3">
                  <p className="text-sm font-bold">{v.user?.name || "?"} {v.user?.pseudo && <span className="text-accent">@{v.user.pseudo}</span>}</p>
                  <p className="text-[11px] text-muted">{v.user?.email}</p>
                  <VerificationDecision requestId={v.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tickets support */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><LifeBuoy className="h-5 w-5 text-accent" />Tickets support ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <p className="text-sm italic text-muted">Aucun ticket.</p>
        ) : (
          <div className="grid gap-2">
            {tickets.map((t) => (
              <Card key={t.id} className="p-3">
                <p className="text-sm font-semibold">{t.email} <span className="text-[11px] font-normal text-muted">· {timeAgo(t.created_at)}</span></p>
                <p className="text-sm text-muted">{t.message}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Membres */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Users className="h-5 w-5 text-accent" />
            {q ? `Résultats pour "${q}"` : "Membres récents"} ({users.length})
          </h2>
          <form action="/admin" method="GET" className="flex max-w-[200px] gap-2">
            <Input name="q" placeholder="Chercher..." defaultValue={q} className="h-8 text-xs" />
          </form>
        </div>
        <div className="grid gap-1.5">
          {users.map((u) => (
            <Card key={u.id} className={`flex items-center justify-between gap-3 p-2.5 text-sm ${u.is_banned ? "opacity-50 grayscale" : ""}`}>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{u.name || "—"}</span>
                  {u.pseudo && <span className="text-accent"> @{u.pseudo}</span>}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <a href={`mailto:${u.email}`} className="hover:text-accent hover:underline">
                    {u.email}
                  </a>
                  {u.is_banned && (
                    <span className="font-black uppercase text-danger">
                      • BANNI {u.banned_until ? `jusqu'au ${timeAgo(u.banned_until)}` : "PERMANENT"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex gap-1">
                  {u.verification_level > 0 && <span title="Vérifié">✅</span>}
                  {u.is_premium && <span title="Vib+++">💎</span>}
                </span>
                <BanUserAction userId={u.id} isBanned={!!u.is_banned} />
              </div>
            </Card>
          ))}
          {users.length === 0 && (
            <p className="py-4 text-center text-sm italic text-muted">Aucun membre trouvé.</p>
          )}
        </div>
      </div>
    </section>
  );
}
