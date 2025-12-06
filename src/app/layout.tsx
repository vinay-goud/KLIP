import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import Sidebar from "./_components/Sidebar";
import BottomNav from "./_components/BottomNav";
import { AuthModalProvider } from "./_components/AuthModalContext";
import AuthModals from "./_components/AuthModals";
import PWARegister from "./_components/PWARegister";

export const metadata: Metadata = {
  title: "KLIP - Short-Form Video Platform",
  description: "Share and discover amazing short videos",
  icons: [{ rel: "icon", url: "/logo.png" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KLIP",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="bg-black">
        <TRPCReactProvider>
          <AuthModalProvider>
            <PWARegister />
            <div className="flex h-[100dvh] overflow-hidden">
              <Sidebar session={session} />
              <main className="flex-1 overflow-auto md:ml-64">
                {children}
              </main>
            </div>
            <BottomNav />
            <AuthModals />
          </AuthModalProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
