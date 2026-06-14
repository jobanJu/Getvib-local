import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-8 w-8",
} as const;

export function Spinner({
  size = "default",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <Loader2
      role="status"
      aria-label="Chargement"
      className={cn("animate-spin text-accent", sizes[size], className)}
    />
  );
}
