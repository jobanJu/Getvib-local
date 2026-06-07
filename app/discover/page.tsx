import { SlidersHorizontal } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { listPublishedEvents } from "@/features/events/server";
import { formatEventDate } from "@/lib/date";
import type { VibeEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const events = await listPublishedEvents();

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-semibold text-accent-secondary">Lille</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Découvrir les soirées</h1>
          <p className="mt-3 max-w-2xl text-muted">Des soirées privées en petit comité, filtrées par vibe et niveau de confiance.</p>
        </div>
        <Button variant="secondary">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event: VibeEvent) => (
          <EventCard
            key={event.id}
            event={{
              id: event.id,
              title: event.title,
              description: event.description,
              image: event.image,
              vibe: event.vibe,
              type: event.type,
              city: event.city,
              dateLabel: formatEventDate(event.date),
              participants: event.participants.length,
              maxParticipants: event.maxParticipants,
              contributionAmount: event.contributionAmount,
            }}
          />
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted">
            Aucune soirée prévue pour le moment.
          </div>
        )}
      </div>
    </section>
  );
}
