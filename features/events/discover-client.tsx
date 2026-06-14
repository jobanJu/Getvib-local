"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Share2 } from "lucide-react";
import { EventCard, type EventCardData } from "@/components/events/event-card";
import { VIBES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { isToday, isTomorrow, isThisWeekend } from "@/lib/date";

type Props = {
  events: EventCardData[];
  city?: string;
};

type DateFilter = "all" | "today" | "tomorrow" | "weekend";
type TypeFilter = "all" | "free" | "plus";

export function DiscoverClient({ events, city = "votre ville" }: Props) {
  const [query, setQuery] = useState("");
  const [vibeFilter, setVibeFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Extraire toutes les villes uniques des événements
  const availableCities = useMemo(() => {
    const cities = new Set(events.map(e => e.city));
    return Array.from(cities).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      // Recherche textuelle
      const matchesQuery =
        !q || [e.title, e.vibe, e.city, e.description].some((field) => field?.toLowerCase().includes(q));
      
      // Filtre Vibe
      const matchesVibe = !vibeFilter || e.vibe === vibeFilter;

      // Filtre Ville
      const matchesCity = cityFilter === "all" || e.city === cityFilter;

      // Filtre Date
      const d = new Date(e.rawDate);
      let matchesDate = true;
      if (dateFilter === "today") matchesDate = isToday(d);
      else if (dateFilter === "tomorrow") matchesDate = isTomorrow(d);
      else if (dateFilter === "weekend") matchesDate = isThisWeekend(d);

      // Filtre Type
      let matchesType = true;
      if (typeFilter === "free") matchesType = e.type === "vib";
      else if (typeFilter === "plus") matchesType = e.type === "vibplus";

      return matchesQuery && matchesVibe && matchesCity && matchesDate && matchesType;
    });
  }, [events, query, vibeFilter, cityFilter, dateFilter, typeFilter]);

  const vibPlus = filtered.filter((e) => e.type === "vibplus");

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GetVib',
        text: 'Découvre les meilleures vibes près de chez toi !',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié !");
    }
  };

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 animate-fade-in-up">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-accent">{city}</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">Vibes près de toi</h1>
          </div>
          <button 
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-muted hover:bg-foreground/10 transition"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une vibe, une ville…"
              className="h-12 w-full rounded-2xl border border-border bg-foreground/5 pl-12 pr-4 text-sm text-foreground outline-none transition focus:border-accent focus:bg-foreground/8"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border transition",
              showFilters ? "border-accent bg-accent/10 text-accent" : "border-border bg-foreground/5 text-muted"
            )}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-4 rounded-3xl border border-border bg-card-soft p-5 animate-in slide-in-from-top-2 duration-300">
            <div className="grid gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Quand ?</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Peu importe" },
                  { id: "today", label: "Aujourd'hui" },
                  { id: "tomorrow", label: "Demain" },
                  { id: "weekend", label: "Ce week-end" },
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDateFilter(d.id as DateFilter)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
                      dateFilter === d.id ? "bg-accent text-white" : "bg-foreground/5 text-muted hover:bg-foreground/10"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Format</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Tous" },
                  { id: "free", label: "Vib · Gratuit" },
                  { id: "plus", label: "Vib+ · Payant" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id as TypeFilter)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
                      typeFilter === t.id ? "bg-accent text-white" : "bg-foreground/5 text-muted hover:bg-foreground/10"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {availableCities.length > 0 && (
              <div className="grid gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Ville</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCityFilter("all")}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold transition",
                      cityFilter === "all" ? "bg-accent text-white" : "bg-foreground/5 text-muted hover:bg-foreground/10"
                    )}
                  >
                    Toutes les villes
                  </button>
                  {availableCities.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCityFilter(c)}
                      className={cn(
                        "rounded-xl px-4 py-2 text-sm font-semibold transition",
                        cityFilter === c ? "bg-accent text-white" : "bg-foreground/5 text-muted hover:bg-foreground/10"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtres par type de vibe */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setVibeFilter(null)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              vibeFilter === null
                ? "border-accent bg-accent/15 text-foreground"
                : "border-foreground/15 bg-foreground/5 text-muted hover:text-foreground",
            )}
          >
            Toutes les vibes
          </button>
          {VIBES.map((v) => (
            <button
              key={v}
              onClick={() => setVibeFilter((cur) => (cur === v ? null : v))}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                vibeFilter === v
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-foreground/15 bg-foreground/5 text-muted hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="animate-fade-in py-16 text-center text-muted">
          {query || vibeFilter ? "Aucune vibe ne correspond à ta recherche." : "Aucune vibe prévue pour le moment."}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            <h2 className="text-lg font-bold">À l&#39;affiche</h2>
            <div className="stagger -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x [&::-webkit-scrollbar]:hidden">
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
                Sélection <span className="rounded-full bg-gradient-to-r from-accent to-accent-secondary px-2 py-0.5 text-sm font-bold text-white">GetVib+++</span>
              </h2>
              <div className="stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
