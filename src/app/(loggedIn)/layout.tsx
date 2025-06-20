import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const isLoggedIn = !!session;

  if (!isLoggedIn) {
    redirect("/api/auth/signin");
  }

  return children;
}
