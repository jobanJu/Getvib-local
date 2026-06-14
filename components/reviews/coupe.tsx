import { cn } from "@/lib/utils";

// Coupe de champagne sur-mesure, dans le style du logo GetVib (bol trapézoïdal
// sur pied). Utilise `currentColor` pour le trait ET le remplissage : la couleur
// se pilote donc via les classes `text-*`. `filled` = coupe pleine (dorée).
export function Coupe({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Liquide (remplit le bol quand la coupe est « pleine ») */}
      <path d="M5.6 4.4 L18.4 4.4 L12 12 Z" fill={filled ? "currentColor" : "none"} stroke="none" />
      {/* Bol */}
      <path d="M5.6 4.4 L18.4 4.4 L12 12 Z" />
      {/* Pied */}
      <path d="M12 12 V19" />
      {/* Base */}
      <path d="M8.2 19.2 H15.8" />
    </svg>
  );
}
