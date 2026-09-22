import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BUSINESS } from "@/lib/constants";

const links = [
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Areas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/faq", label: "FAQ" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "Our Story" },
];

export function Header() {
  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <BrandMark size={52} className="h-[52px] w-[52px] shrink-0" priority />
          <span className="leading-tight">
            <span className="font-display block text-lg font-semibold tracking-tight text-paper">
              {BUSINESS.name}
            </span>
            <span className="hidden whitespace-nowrap text-xs text-sun-on-ink sm:block">
              Brisbane · mobile detailing
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link rounded-full px-3 py-2 text-sm font-semibold transition hover:bg-paper/10"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
            className="hidden text-sm font-semibold sm:inline lg:inline"
          >
            {BUSINESS.phone}
          </a>
          <Link href="/book" className="btn btn-accent text-sm py-2.5 px-4">
            Book a detail
          </Link>
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-white/10 px-3 py-2 md:hidden"
        aria-label="Mobile"
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="nav-link shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="greek-rail" aria-hidden />
    </header>
  );
}
