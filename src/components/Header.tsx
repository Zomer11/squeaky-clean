import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BUSINESS } from "@/lib/constants";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Areas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/donation", label: "Donations" },
  { href: "/faq", label: "FAQ" },
  { href: "/book", label: "Book" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "Our Story" },
];

export function Header() {
  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex w-full max-w-[90rem] items-center gap-5 px-4 py-3 md:px-6 xl:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
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

        <nav className="hidden min-w-0 flex-1 items-center justify-evenly md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link whitespace-nowrap rounded-full px-2 py-2 text-sm font-semibold transition hover:bg-paper/10 xl:px-3"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-6">
          <a
            href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
            className="hidden whitespace-nowrap text-sm font-semibold lg:inline"
          >
            {BUSINESS.phone}
          </a>
          <Link href="/book" className="btn btn-accent whitespace-nowrap px-4 py-2.5 text-sm">
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
    </header>
  );
}
