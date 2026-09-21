import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="section-pad mx-auto max-w-2xl text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        That page drove off.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-ink-soft">
        No driveway here. The calendar, prices, and suburb list are still
        where you left them.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-accent">
          Back home
        </Link>
        <Link href="/book" className="btn btn-primary">
          Book a detail
        </Link>
        <Link href="/areas" className="btn btn-ghost">
          Service areas
        </Link>
      </div>
    </div>
  );
}
