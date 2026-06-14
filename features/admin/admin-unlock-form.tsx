"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminUnlockForm() {
  const router = useRouter();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p1, p2 }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || "Déverrouillage impossible.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-5 grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        Mot de passe 1
        <Input type="password" value={p1} onChange={(e) => setP1(e.target.value)} required autoComplete="off" placeholder="••••••••" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Mot de passe 2
        <Input type="password" value={p2} onChange={(e) => setP2(e.target.value)} required autoComplete="off" placeholder="••••••••" />
      </label>
      {error && <p className="text-sm font-semibold text-danger">{error}</p>}
      <Button type="submit" loading={loading} className="py-6 font-bold">
        Déverrouiller
      </Button>
    </form>
  );
}
