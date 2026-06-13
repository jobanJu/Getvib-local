"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleSignOut}
      disabled={loading}
      className={className ?? "text-red-400 border-red-400/20 hover:bg-red-400/10"}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {loading ? "Déconnexion..." : "Déconnexion"}
    </Button>
  );
}
