import { CreateEventForm } from "@/features/events/create-event-form";

export default function CreatePage() {
  return (
    <section className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
      <div>
        <p className="font-semibold text-accent-secondary">Hôte</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Créer une soirée</h1>
        <p className="mt-4 leading-7 text-muted">
          L’adresse exacte reste privée. Les invités acceptés voient seulement la zone jusqu’à la fenêtre de révélation.
        </p>
      </div>
      <CreateEventForm />
    </section>
  );
}
