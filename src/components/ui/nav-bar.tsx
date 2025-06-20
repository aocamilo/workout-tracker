"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dumbbell } from "lucide-react";
import type { User } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

function NavBar({
  isLoggedIn,
  user,
}: {
  isLoggedIn: boolean;
  user: User | undefined;
}) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="ml-4 flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Dumbbell className="text-primary h-6 w-6" />
            <span className="ml-4 text-xl font-bold">Workout Tracker</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link href="/dashboard" className="text-primary">
              Dashboard
            </Link>
            <Link
              href="/workouts"
              className="hover:text-primary transition-colors"
            >
              Workouts
            </Link>
            <Link
              href="/progress"
              className="hover:text-primary transition-colors"
            >
              Progress
            </Link>
            <Link
              href="/exercises"
              className="hover:text-primary transition-colors"
            >
              Exercises
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image ?? "/placeholder.svg"}
                      alt={user?.name ?? "User"}
                    />
                    <AvatarFallback>
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user?.name}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/workouts">My Workouts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={() => signIn()}>
                Sign In
              </Button>
              <Button onClick={() => signIn()}>Get Started</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { NavBar };
