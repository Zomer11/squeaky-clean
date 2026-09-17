import Link from "next/link";
import { SqueakyDuck } from "@/components/SqueakyDuck";
import { BUSINESS } from "@/lib/constants";

const links = [
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Areas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/faq", label: "FAQ" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-sun/25 ring-1 ring-sun/40 transition group-hover:rotate-[-6deg]">
            <SqueakyDuck size={40} mood="still" />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg font-semibold tracking-tight text-ink">
              {BUSINESS.name}
            </span>
            <span className="hidden text-xs text-ink-soft sm:block">
              Brisbane · mobile detailing
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-paper hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
            className="hidden text-sm font-semibold text-ink-soft sm:inline lg:inline"
          >
            {BUSINESS.phone}
          </a>
          <Link href="/book" className="btn btn-accent text-sm py-2.5 px-4">
            Book a detail
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-line/60 px-3 py-2 md:hidden"
        aria-label="Mobile"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="nav-link shrink-0 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-ink-soft ring-1 ring-line"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
