"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, MessageCircle, Plus, Settings, Shield, UserRound } from "lucide-react";
import { AuthProvider } from "@/features/auth/auth-provider";
import { cn } from "@/lib/utils";

const primaryNav = [
  { href: "/discover" as const, label: "Découvrir", icon: Compass },
  { href: "/create" as const, label: "Créer", icon: Plus },
  { href: "/messages" as const, label: "Messages", icon: MessageCircle },
  { href: "/profile" as const, label: "Profil", icon: UserRound },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isLanding = pathname === "/";

  return (
    <AuthProvider>
      <div className="min-h-screen pb-20 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-border bg-background/82 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-sm shadow-[0_0_35px_rgba(124,58,237,0.45)]">
                GV
              </span>
              <span>GetVib</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-white/8 hover:text-white",
                    pathname.startsWith(item.href) && "bg-white/10 text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link className="hidden rounded-xl p-2 text-muted transition hover:bg-white/8 hover:text-white md:block" href="/notifications">
                <Bell className="h-5 w-5" />
              </Link>
              <Link className="hidden rounded-xl p-2 text-muted transition hover:bg-white/8 hover:text-white md:block" href="/safety">
                <Shield className="h-5 w-5" />
              </Link>
              <Link className="rounded-xl p-2 text-muted transition hover:bg-white/8 hover:text-white" href="/settings">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </header>

        <main>{children}</main>

        {!isLanding && (
          <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/92 px-2 py-2 backdrop-blur-2xl md:hidden">
            <div className="grid grid-cols-4 gap-1">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "grid min-h-14 place-items-center rounded-xl text-[0.68rem] font-semibold text-muted",
                      active && "bg-accent/18 text-white",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </AuthProvider>
  );
}
