"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, MessageCircle, Plus, Settings, Shield, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/discover" as const, label: "Découvrir", icon: Compass },
  { href: "/create" as const, label: "Créer", icon: Plus },
  { href: "/messages" as const, label: "Messages", icon: MessageCircle },
  { href: "/profile" as const, label: "Profil", icon: UserRound },
] as const;

// Mobile bottom nav: 2 items à gauche, FAB central « Créer », 2 items à droite.
const mobileLeft = [
  { href: "/discover" as const, label: "Explorer", icon: Compass },
  { href: "/messages" as const, label: "Messages", icon: MessageCircle },
] as const;

const mobileRight = [
  { href: "/notifications" as const, label: "Alertes", icon: Bell },
  { href: "/profile" as const, label: "Profil", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-black shadow-[0_0_30px_rgba(246,51,154,0.5)] ring-1 ring-accent/40">
              <Image src="/logo.png" alt="GetVib" width={36} height={36} className="h-full w-full object-cover" priority />
            </span>
            <span className="text-lg tracking-tight">GetVib</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-foreground/8 hover:text-foreground",
                  pathname.startsWith(item.href) && "bg-foreground/10 text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link className="hidden rounded-xl p-2 text-muted transition hover:bg-foreground/8 hover:text-foreground md:block" href="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
            <Link className="hidden rounded-xl p-2 text-muted transition hover:bg-foreground/8 hover:text-foreground md:block" href="/safety">
              <Shield className="h-5 w-5" />
            </Link>
            <Link className="rounded-xl p-2 text-muted transition hover:bg-foreground/8 hover:text-foreground" href="/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {!isLanding && (
        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/92 px-3 pb-2 pt-2 backdrop-blur-2xl md:hidden">
          <div className="relative mx-auto grid max-w-md grid-cols-5 items-end">
            {mobileLeft.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "grid place-items-center gap-1 rounded-xl py-1.5 text-[0.62rem] font-semibold text-muted transition",
                    active && "text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-accent")} />
                  {item.label}
                </Link>
              );
            })}

            <div className="flex justify-center">
              <Link
                href="/create"
                aria-label="Créer une soirée"
                className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-accent text-foreground shadow-[0_10px_30px_rgba(246,51,154,0.55)] ring-4 ring-background transition active:scale-95"
              >
                <Plus className="h-6 w-6" />
              </Link>
            </div>

            {mobileRight.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "grid place-items-center gap-1 rounded-xl py-1.5 text-[0.62rem] font-semibold text-muted transition",
                    active && "text-foreground",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-accent")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
