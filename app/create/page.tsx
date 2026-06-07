"use client";

import { CreateEventForm } from "@/features/events/create-event-form";
import { useAuth } from "@/features/auth/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function CreateEventPage() {
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
          <h1 className="text-2xl font-bold">Prêt à héberger une vibe ?</h1>
          <p className="text-muted text-sm">Vous devez être connecté pour créer une soirée.</p>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">Créer une soirée</h1>
        <p className="mt-2 text-muted">Partagez votre passion et rencontrez de nouvelles personnes.</p>
      </div>
      <CreateEventForm />
    </section>
  );
}
