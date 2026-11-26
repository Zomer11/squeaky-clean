"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type Props = {
  links: { href: string; label: string }[];
  phone: string;
  brand: ReactNode;
};

export function HeaderShell({ links, phone, brand }: Props) {
  const path = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) {
    setLastPath(path);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <div className="site-header-bar">
        {brand}
        <nav className="site-nav" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="site-nav-link"
              aria-current={path.startsWith(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="site-header-cta">
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="site-phone">
            {phone}
          </a>
          <Link href="/book" className="btn btn-accent btn-sm">
            Book
          </Link>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i />
            <i />
          </button>
        </div>
      </div>
      <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile" hidden={!open}>
        {links.map((l, i) => (
          <Link key={l.href} href={l.href} style={{ "--i": i } as React.CSSProperties}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {l.label}
          </Link>
        ))}
        <a href={`tel:${phone.replace(/\s/g, "")}`} className="mobile-menu-phone">
          Call {phone}
        </a>
      </nav>
    </header>
  );
}
