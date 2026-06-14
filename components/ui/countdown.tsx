"use client";

import { useEffect, useState } from "react";

export function Countdown({ targetDate, label }: { targetDate: string; label?: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        setTimeLeft("Maintenant !");
        clearInterval(interval);
        return;
      }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours > 0 ? `${hours}h ` : ""}${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-accent/10 p-3 text-center border border-accent/20">
      <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
        {label || "Révélation dans"}
      </p>
      <p className="text-xl font-black text-foreground tabular-nums">
        {timeLeft}
      </p>
    </div>
  );
}
