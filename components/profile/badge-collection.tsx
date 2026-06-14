import {
  Crown,
  Diamond,
  Flame,
  HeartHandshake,
  Lock,
  Moon,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { computeBadges, type BadgeStats, type BadgeTier } from "@/lib/badges";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  PartyPopper,
  Sparkles,
  Moon,
  HeartHandshake,
  Flame,
  Diamond,
  Users,
  Crown,
};

// Style par palier : couleur de l'icône + halo quand le badge est débloqué.
const TIER_STYLE: Record<BadgeTier, { ring: string; icon: string; glow: string }> = {
  verified: {
    ring: "border-emerald-400/40 bg-emerald-400/10",
    icon: "text-emerald-300",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.35)]",
  },
  bronze: {
    ring: "border-amber-600/40 bg-amber-600/10",
    icon: "text-amber-500",
    glow: "shadow-[0_0_20px_rgba(217,119,6,0.25)]",
  },
  silver: {
    ring: "border-slate-300/30 bg-slate-300/10",
    icon: "text-slate-200",
    glow: "shadow-[0_0_20px_rgba(203,213,225,0.25)]",
  },
  gold: {
    ring: "border-yellow-400/45 bg-yellow-400/10",
    icon: "text-yellow-300",
    glow: "shadow-[0_0_28px_rgba(250,204,21,0.4)]",
  },
  premium: {
    ring: "border-accent/45 bg-gradient-to-br from-accent/20 to-accent-secondary/20",
    icon: "text-pink-200",
    glow: "shadow-[0_0_28px_rgba(246,51,154,0.4)]",
  },
};

export function BadgeCollection({ stats }: { stats: BadgeStats }) {
  const badges = computeBadges(stats);
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="h-5 w-5 text-accent" />
          Mes badges
          <span className="text-base font-normal text-muted">
            ({unlockedCount}/{badges.length})
          </span>
        </h2>
      </div>

      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon] ?? Sparkles;
          const style = TIER_STYLE[badge.tier];
          const pct = badge.progress
            ? Math.round((badge.progress.current / badge.progress.target) * 100)
            : 0;

          return (
            <div
              key={badge.id}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-transform duration-300 hover:-translate-y-0.5",
                badge.unlocked
                  ? cn(style.ring, style.glow)
                  : "border-foreground/10 bg-foreground/5",
              )}
            >
              <div
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-full",
                  badge.unlocked ? cn("bg-background/40", style.icon) : "bg-foreground/10 text-muted",
                )}
              >
                {badge.unlocked ? (
                  <Icon className="h-6 w-6" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>

              <div>
                <p className={cn("text-sm font-bold", !badge.unlocked && "text-muted")}>{badge.name}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted">{badge.description}</p>
              </div>

              {!badge.unlocked && badge.progress && (
                <div className="mt-1 w-full">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] font-semibold text-muted">
                    {badge.progress.current}/{badge.progress.target}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
