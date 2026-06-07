"use client";

import { useAuth } from "@/features/auth/auth-provider";
import { NotificationsList } from "@/features/notifications/notifications-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function NotificationsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto grid max-w-md content-center px-4 py-16">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Gardez le contact</h1>
          <p className="text-muted text-sm">Connectez-vous pour voir vos notifications.</p>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-black tracking-tight">Notifications</h1>
      <NotificationsList />
    </section>
  );
}
