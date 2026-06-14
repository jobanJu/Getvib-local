import { Diamond } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Distinction visuelle unique GetVib / GetVib+++ (premium). Utilisée partout
// (carte, page événement…) pour éviter toute incohérence de style.
export function VibBadge({ type, className }: { type: string; className?: string }) {
  if (type === "vibplus") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-accent-secondary px-2.5 py-1 text-xs font-bold text-white shadow-[0_4px_14px_rgba(246,51,154,0.45)]",
          className,
        )}
      >
        <Diamond className="h-3.5 w-3.5" />
        GetVib+++
      </span>
    );
  }
  return (
    <Badge tone="green" className={className}>
      GetVib
    </Badge>
  );
}
