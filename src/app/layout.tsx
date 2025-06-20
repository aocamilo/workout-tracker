import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Track your workouts and achieve your fitness goals",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const isLoggedIn = !!session;
  const user = session?.user;

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="mx-40">
        <Suspense fallback={<div>Loading...</div>}>
          <SessionProvider>
            <TRPCReactProvider>
              <NavBar isLoggedIn={isLoggedIn} user={user} />
              {children}
              <Footer />
            </TRPCReactProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
