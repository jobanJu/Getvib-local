import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { TermsBlocker } from "@/components/layout/terms-blocker";
import { AccessConsentBanner } from "@/features/moderation/access-consent-banner";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ThemeProvider } from "@/features/auth/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { RealtimeNotifications } from "@/features/notifications/realtime-notifications";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getvib.fr"),
  title: {
    default: "GetVib",
    template: "%s - GetVib",
  },
  description:
    "Rencontrez des personnes qui partagent réellement vos passions autour de soirées privées sélectionnées.",
  applicationName: "GetVib",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GetVib",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#06060A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={geist.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const hour = new Date().getHours();
                  const isDay = hour >= 8 && hour < 18;
                  const initialTheme = isDay ? "light" : "dark";
                  const theme = localStorage.getItem("theme") || initialTheme;
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <RealtimeNotifications />
              <PwaInstallPrompt />
              <AppShell>{children}</AppShell>
              <TermsBlocker />
              <AccessConsentBanner />
              <ServiceWorkerRegister />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
