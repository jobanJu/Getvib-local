"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // On affiche le prompt après 5 secondes pour ne pas être trop intrusif
      setTimeout(() => setIsVisible(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="flex items-center gap-4 rounded-2xl border border-accent/20 bg-card p-4 shadow-2xl">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Download className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold leading-tight">Installer GetVib</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ajoute l&#39;application à ton écran d&#39;accueil.</p>
        </div>
        <div className="flex flex-col gap-2">
            <Button size="sm" onClick={handleInstall} className="font-bold h-9">
                Installer
            </Button>
            <button 
                onClick={() => setIsVisible(false)}
                className="text-[10px] text-muted-foreground hover:text-foreground uppercase font-black tracking-widest text-center"
            >
                Plus tard
            </button>
        </div>
      </div>
    </div>
  );
}
