import Link from "next/link";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "About",
  description:
    "Squeaky Solutions is a Brisbane mobile car-detailing run — one operator, driveway visits, seven days including Sunday.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageMast title={`About ${BUSINESS.name}`} crumbs={[{ href: "/about", label: "About" }]}>
        <p>
          One operator, Brisbane driveways, seven days including Sunday. Not a
          national call centre.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-3xl !pt-10">
        <div className="prose-like space-y-4 text-ink-soft">
          <p>
            {BUSINESS.name} is a Brisbane mobile car-detailing run. We come to
            your driveway — small, medium, or large — and wash it there.
            Morning or afternoon slots, Sundays included.
          </p>
          <p>
            Book a combined visit, exterior, or interior online. Inquiries: we aim
            to reply the same day.
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
    </>
  );
}
