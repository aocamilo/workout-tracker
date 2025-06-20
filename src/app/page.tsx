import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WorkoutTrackerLanding() {
  const session = await auth();
  const isLoggedIn = !!session;

  if (isLoggedIn) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col justify-center">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="secondary" className="px-3 py-1">
                  Track • Progress • Achieve
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Fitness Journey
                  <br />
                  <span className="text-primary">Starts Here</span>
                </h1>
                <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                  Track your workouts, monitor your progress, and achieve your
                  fitness goals with our comprehensive workout tracker. Join
                  thousands of users who have transformed their fitness journey.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/api/auth/signin">
                  <Button className="cursor-pointer" size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
