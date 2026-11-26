"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const HIDDEN = new Set(["/book", "/admin", "/thanks"]);

export function StickyBookBar() {
  const path = usePathname() ?? "";
  const isHome = path === "/";
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const on = () => {
      const hero = document.querySelector<HTMLElement>(".wash-hero");
      setPastHero(!hero || window.scrollY > hero.offsetHeight - window.innerHeight * 0.5);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [isHome]);

  if (!path || HIDDEN.has(path) || path.startsWith("/admin")) return null;
  if (isHome && !pastHero) return null;

  return (
    <div className="sticky-book-bar md:hidden">
      <Link href="/book" className="btn btn-accent w-full">
        Book a driveway slot
      </Link>
    </div>
  );
}
