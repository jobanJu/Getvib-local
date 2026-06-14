import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LockKeyhole, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VibBadge } from "@/components/events/vib-badge";
import { cn } from "@/lib/utils";

export type EventCardData = {
  id: string;
  title: string;
  description: string;
  image: string;
  vibe: string;
  type: "vib" | "vibplus";
  city: string;
  dateLabel: string;
  rawDate: string;
  participants: number;
  maxParticipants: number;
  contributionAmount: number;
};

export function EventCard({ event }: { event: EventCardData }) {
  const isPlus = event.type === "vibplus";
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(0,0,0,0.18)]",
        // GetVib+++ : liseré premium pour le distinguer au premier coup d'œil.
        isPlus && "border-accent/40 ring-1 ring-accent/30 shadow-[0_0_30px_rgba(246,51,154,0.18)]",
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image src={event.image} alt="" fill unoptimized className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 420px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <VibBadge type={event.type} />
          <Badge>{event.vibe}</Badge>
        </div>
      </div>
      <div className="grid gap-4 p-4">
        <div>
          <h3 className="text-xl font-semibold leading-tight">{event.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{event.description}</p>
        </div>
        <div className="grid gap-2 text-sm text-muted">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent-secondary" />
            {event.dateLabel}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent-secondary" />
            {event.city}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent-secondary" />
            {event.participants}/{event.maxParticipants} invités
          </span>
          <span className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-accent-secondary" />
            Adresse privée
          </span>
        </div>
        <Button asChild>
          <Link href={`/event/${event.id}`}>Voir la soirée</Link>
        </Button>
      </div>
    </Card>
  );
}
