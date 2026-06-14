"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus, Check, Clock, Loader2, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Result = {
  id: string;
  name: string | null;
  pseudo: string | null;
  photo_url: string | null;
  city: string | null;
  status: "none" | "friends" | "sent" | "received";
};

// Recherche d'utilisateurs par @pseudo (ou nom) + envoi de demande d'ami.
// Utilisé sur la page /amis et dans l'onglet Amis de Messages.
export function AddFriend() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Debounce : on attend 350ms après la dernière frappe avant d'interroger l'API.
  useEffect(() => {
    const q = query.trim().replace(/^@+/, "");
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  async function addFriend(id: string) {
    setPendingId(id);
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: id }),
      });
      if (res.ok) {
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: "sent" } : r)));
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un ami par @pseudo ou nom…"
          className="pl-9"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted" />}
      </div>

      {searched && results.length === 0 && !loading && (
        <p className="px-1 text-sm text-muted">Aucun utilisateur trouvé pour « {query} ».</p>
      )}

      {results.length > 0 && (
        <div className="grid gap-2">
          {results.map((r) => (
            <Card key={r.id} className="flex items-center gap-3 p-3">
              <Link
                href={r.pseudo ? `/u/${r.pseudo}` : "#"}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                {r.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/20 text-accent">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{r.name || "Sans nom"}</p>
                  <p className="flex items-center gap-2 truncate text-xs text-muted">
                    {r.pseudo && <span className="font-semibold text-accent">@{r.pseudo}</span>}
                    {r.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {r.city}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
              {r.status === "friends" ? (
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
                  <Check className="h-4 w-4" /> Amis
                </span>
              ) : r.status === "sent" ? (
                <span className="flex items-center gap-1 text-sm font-semibold text-muted">
                  <Clock className="h-4 w-4" /> Envoyée
                </span>
              ) : r.status === "received" ? (
                <span className="text-sm font-semibold text-accent">À accepter</span>
              ) : (
                <Button size="sm" onClick={() => addFriend(r.id)} loading={pendingId === r.id}>
                  <UserPlus className="h-4 w-4" /> Ajouter
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
