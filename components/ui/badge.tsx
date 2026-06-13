import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "purple" | "green" | "amber" | "red" | "neutral";
  className?: string;
};

const tones = {
  purple: "border-accent/30 bg-accent/15 text-pink-100",
  green: "border-emerald-400/30 bg-emerald-400/15 text-emerald-100",
  amber: "border-amber-400/30 bg-amber-400/15 text-amber-100",
  red: "border-red-400/30 bg-red-400/15 text-red-100",
  neutral: "border-white/10 bg-white/8 text-muted",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
