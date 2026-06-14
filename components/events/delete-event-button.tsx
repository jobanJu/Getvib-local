"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";

type Props = {
  eventId: string;
  eventTitle?: string;
  onDeleted?: () => void;
  className?: string;
};

export function DeleteEventButton({ eventId, eventTitle, onDeleted, className }: Props) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const label = eventTitle ? `« ${eventTitle} »` : "cette vibe";
    if (!window.confirm(`Supprimer ${label} ? Cette action est définitive et annule les candidatures et discussions liées.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Échec de la suppression.");
      }

      onDeleted?.();
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Échec de la suppression.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className={className ?? "text-red-400 border-red-400/20 hover:bg-red-400/10"}
    >
      <Trash2 className="h-4 w-4 sm:mr-1.5" />
      <span className="hidden sm:inline">{loading ? "..." : "Supprimer"}</span>
    </Button>
  );
}
