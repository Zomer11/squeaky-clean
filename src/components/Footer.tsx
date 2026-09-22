import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { IconMark } from "@/components/IconMark";
import { BUSINESS } from "@/lib/constants";
import { isPublishedAbn } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="greek-rail" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark size={64} className="h-16 w-16 shrink-0" />
            <p className="font-display text-2xl font-semibold">{BUSINESS.name}</p>
          </div>
          <p className="mt-2 max-w-sm text-sm text-paper/85">{BUSINESS.tagline}</p>
          <p className="mt-4 text-sm text-paper/80">{BUSINESS.hours}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-on-ink">
            Contact
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 hover:text-sun-on-ink"
              >
                <IconMark name="phone" className="h-4 w-4" />
                {BUSINESS.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="inline-flex items-center gap-2 hover:text-sun-on-ink"
              >
                <IconMark name="mail" className="h-4 w-4" />
                {BUSINESS.email}
              </a>
            </li>
            {isPublishedAbn(BUSINESS.abn) ? (
              <li className="text-paper/80">ABN {BUSINESS.abn}</li>
            ) : null}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-on-ink">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-sun-on-ink">
                Services & pricing
              </Link>
            </li>
            <li>
              <Link href="/areas" className="hover:text-sun-on-ink">
                Service areas
              </Link>
            </li>
            <li>
              <Link href="/book" className="hover:text-sun-on-ink">
                Book online
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-sun-on-ink">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="hover:text-sun-on-ink">
                Typical jobs
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-sun-on-ink">
                Our Story
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-sun-on-ink">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-sun-on-ink">
                Cookies
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-sun-on-ink">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/refunds" className="hover:text-sun-on-ink">
                Refunds
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-paper/80">
        © {new Date().getFullYear()} {BUSINESS.name}. Brisbane mobile car
        detailing.
      </div>
    </footer>
  );
}
