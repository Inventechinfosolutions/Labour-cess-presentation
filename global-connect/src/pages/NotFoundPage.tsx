import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <h1 className="font-display text-3xl font-bold text-navy">Page not found</h1>
      <Link to="/global-connect" className="text-primary underline-offset-4 hover:underline">
        Go to Global Connect
      </Link>
    </main>
  );
}
