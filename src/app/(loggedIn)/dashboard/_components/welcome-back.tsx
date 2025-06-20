import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

async function WelcomeBack() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {user.name?.split(" ")[0]}!
      </h1>
      <p className="text-muted-foreground">
        Ready to crush today&apos;s workout? You&apos;re on a 13-day streak! 🔥
      </p>
    </div>
  );
}

export { WelcomeBack };
