"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareQuote, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Stars } from "@/components/reviews/stars";
import { Coupe } from "@/components/reviews/coupe";
import type { EventReview } from "@/features/events/server";

type Props = {
  eventId: string;
  reviews: EventReview[];
  canReview: boolean;
  average: number;
};

export function EventReviews({ eventId, reviews, canReview, average }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (rating < 1) {
      setError("Choisis une note.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Avis impossible.");
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avis impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MessageSquareQuote className="h-5 w-5 text-accent" />
          Avis ({reviews.length})
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Stars value={average} />
            <span className="text-sm font-bold">{average.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Formulaire (seulement si éligible et pas encore soumis) */}
      {canReview && !done && (
        <div className="mb-5 rounded-2xl border border-accent/20 bg-accent/5 p-4">
          <p className="mb-2 text-sm font-semibold">Partage ton ressenti sur cette vibe</p>
          <div className="mb-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n} coupe${n > 1 ? "s" : ""}`}
              >
                <Coupe
                  filled={n <= (hover || rating)}
                  className={`h-7 w-7 transition ${
                    n <= (hover || rating) ? "text-amber-400" : "text-foreground/25"
                  }`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ambiance, accueil, vibe… (optionnel)"
            className="min-h-20 w-full rounded-xl border border-foreground/10 bg-background/50 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          <Button onClick={submit} loading={loading} className="mt-3">
            Publier mon avis
          </Button>
        </div>
      )}

      {done && (
        <p className="mb-4 rounded-xl bg-success/10 p-3 text-center text-sm font-semibold text-success">
          Merci, ton avis est publié 🥂
        </p>
      )}

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="text-sm italic text-muted">Pas encore d&#39;avis sur cette vibe.</p>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 border-t border-foreground/5 pt-3 first:border-0 first:pt-0">
              {r.author.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.author.photo_url} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-full bg-accent/20 text-accent">
                  <User className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {r.author.pseudo ? (
                    <Link href={`/u/${r.author.pseudo}`} className="truncate text-sm font-bold hover:underline">
                      {r.author.name || "Anonyme"}
                    </Link>
                  ) : (
                    <p className="truncate text-sm font-bold">{r.author.name || "Anonyme"}</p>
                  )}
                  {r.author.pseudo && <span className="text-xs text-accent">@{r.author.pseudo}</span>}
                </div>
                <Stars value={r.rating} className="h-3.5 w-3.5" />
                {r.comment && <p className="mt-1 text-sm text-muted">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
