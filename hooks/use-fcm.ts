"use client";

import { getToken, onMessage } from "firebase/messaging";
import { useEffect } from "react";
import { getClientMessaging } from "@/lib/firebase/client";

export function useFcm(onForegroundMessage?: (payload: unknown) => void) {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setup() {
      if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) return;
      const messaging = await getClientMessaging();
      if (!messaging || Notification.permission === "denied") return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });

      unsubscribe = onMessage(messaging, (payload) => onForegroundMessage?.(payload));
    }

    setup().catch(() => undefined);
    return () => unsubscribe?.();
  }, [onForegroundMessage]);
}
