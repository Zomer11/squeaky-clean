"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN = new Set(["/book", "/admin", "/thanks"]);

export function StickyBookBar() {
  const path = usePathname() ?? "";
  if (!path || HIDDEN.has(path) || path.startsWith("/admin")) return null;

  return (
    <div className="sticky-book-bar md:hidden">
      <Link href="/book" className="btn btn-accent w-full">
        Book a driveway slot
      </Link>
    </div>
  );
}
