import { Coupe } from "@/components/reviews/coupe";
import { cn } from "@/lib/utils";

// Notation en coupes de champagne 🥂 (lecture seule). `className` pilote la taille.
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        return (
          <Coupe
            key={n}
            filled={on}
            className={cn(on ? "text-amber-400" : "text-foreground/20", className)}
          />
        );
      })}
    </div>
  );
}
