import { DiscoverClient } from "@/features/events/discover-client";
import type { EventCardData } from "@/components/events/event-card";
import { listPublishedEvents } from "@/features/events/server";
import { formatEventDate } from "@/lib/date";
import type { VibeEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const events = await listPublishedEvents();

  const cards: EventCardData[] = events.map((event: VibeEvent) => ({
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
  }));

  return <DiscoverClient events={cards} />;
}
