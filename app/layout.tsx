import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { SupportChat } from "@/components/layout/support-chat";
import { TermsBlocker } from "@/components/layout/terms-blocker";

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
    <html lang="fr" className={geist.variable}>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <SupportChat />
        <TermsBlocker />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
