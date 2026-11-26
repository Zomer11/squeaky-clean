import Link from "next/link";
import { HeaderShell } from "@/components/HeaderShell";
import { Wordmark } from "@/components/Wordmark";
import { BUSINESS } from "@/lib/constants";

export const NAV = [
  { href: "/services", label: "Services" },
  { href: "/areas", label: "Areas" },
  { href: "/jobs", label: "Jobs" },
  { href: "/donation", label: "Donations" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <HeaderShell
      links={NAV}
      phone={BUSINESS.phone}
      brand={
        <Link href="/" className="shrink-0" aria-label={`${BUSINESS.name} home`}>
          <Wordmark />
        </Link>
      }
    />
  );
}
