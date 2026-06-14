import { Spinner } from "@/components/ui/spinner";

// Loader plein écran centré — pour les transitions de route et les états de
// chargement d'une page entière. Animation douce d'apparition.
export function PageLoader({ label = "Chargement…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] animate-fade-in flex-col items-center justify-center gap-3 text-muted">
      <Spinner size="lg" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}
