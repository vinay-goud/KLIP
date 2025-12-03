import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import Sidebar from "./_components/Sidebar";
import BottomNav from "./_components/BottomNav";

export const metadata: Metadata = {
  title: "KLIP - Short-Form Video Platform",
  description: "Share and discover amazing short videos",
  icons: [{ rel: "icon", url: "/logo.png" }],
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
          <div className="flex h-screen overflow-hidden">
            <Sidebar session={session} />
            <main className="flex-1 overflow-auto md:ml-64">
              {children}
            </main>
          </div>
          <BottomNav />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
