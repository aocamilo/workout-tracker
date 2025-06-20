import Link from "next/link";

function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
      <p className="text-muted-foreground text-xs">
        © 2025 Workout Tracker. All rights reserved.
      </p>
      <nav className="flex gap-4 sm:ml-auto sm:gap-6">
        <Link className="text-xs underline-offset-4 hover:underline" href="#">
          Contact
        </Link>
      </nav>
    </footer>
  );
}

export { Footer };
