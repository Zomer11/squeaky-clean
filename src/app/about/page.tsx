import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SqueakyDuck } from "@/components/SqueakyDuck";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "About",
  description:
    "Squeaky Clean is a Brisbane mobile car-detailing run — one operator, driveway visits, seven days including Sunday. The duck stays.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="section-pad mx-auto max-w-3xl">
      <Breadcrumbs items={[{ href: "/about", label: "About" }]} />
      <div className="flex items-start gap-4">
        <SqueakyDuck size={88} mood="bob" />
        <div>
          <p className="chip">Local operator</p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
            About {BUSINESS.name}
          </h1>
        </div>
      </div>
      <div className="prose-like mt-6 space-y-4 text-ink-soft">
        <p>
          {BUSINESS.name} is a Brisbane mobile car-detailing run. We come to
          your driveway — hatch, sedan, SUV, or ute — and wash it there. Not a
          national call centre. Morning or afternoon slots, Sundays included.
        </p>
        <p>
          Book exterior, interior, or a full detail online. Inquiries: we aim
          to reply the same day. The duck stays.
        </p>
        <p>
          {BUSINESS.hours}. {BUSINESS.payNote}
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/book" className="btn btn-accent">
          Book a detail
        </Link>
        <Link href="/contact" className="btn btn-ghost">
          Get in touch
        </Link>
      </div>
      <RelatedLinks
        links={[
          {
            href: "/faq",
            label: "FAQ",
            blurb: "Access, dogs, cancel window, what we don’t do.",
          },
          {
            href: "/jobs",
            label: "Typical jobs",
            blurb: "How a visit usually goes.",
          },
        ]}
      />
    </div>
  );
}
