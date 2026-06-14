"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EventCard, type EventCardData } from "@/components/events/event-card";

type Props = {
  events: EventCardData[];
  city?: string;
};

export function DiscoverClient({ events, city = "Lille" }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      [e.title, e.vibe, e.city, e.description].some((field) => field?.toLowerCase().includes(q)),
    );
  }, [events, query]);

  const vibPlus = filtered.filter((e) => e.type === "vibplus");

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4">
        <div>
          <p className="font-semibold text-accent">{city}</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Soirées près de toi</h1>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une vibe, une ville…"
            className="h-12 w-full rounded-2xl border border-border bg-foreground/5 pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-accent focus:bg-foreground/8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted">
          {query ? "Aucune soirée ne correspond à ta recherche." : "Aucune soirée prévue pour le moment."}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            <h2 className="text-lg font-bold">À l&#39;affiche</h2>
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x [&::-webkit-scrollbar]:hidden">
              {filtered.map((event) => (
                <div key={event.id} className="w-72 shrink-0 snap-start">
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          </div>

          {vibPlus.length > 0 && (
            <div className="grid gap-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                Sélection <span className="rounded-full bg-accent/15 px-2 py-0.5 text-sm text-accent">Vib+</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {vibPlus.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
