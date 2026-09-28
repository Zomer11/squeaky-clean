import Link from "next/link";
import { GiveBack } from "@/components/GiveBack";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { DONATION } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Donation",
  description:
    "Your detail, their meal — Squeaky Solutions donates 10% of every job toward Palestine, Sudan and Lebanon.",
  path: "/donation",
});

export default function DonationPage() {
  return (
    <>
      <PageMast
        title="Your detail, their meal."
        crumbs={[{ href: "/donation", label: "Donation" }]}
      >
        <p>
          {DONATION.percent}% of what we take goes toward Palestine, Sudan and
          Lebanon. It comes out of the job total — not an extra on your bill.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-3xl !pt-10">
        <GiveBack />
        <p className="mt-8 text-sm text-ink-soft">
          We haven’t named a single receiving charity on this page yet. If you
          need the recipient in writing,{" "}
          <Link href="/contact" className="font-semibold text-fresh-deep underline">
            ask
          </Link>
          .
        </p>
        <RelatedLinks
          links={[
            {
              href: "/book",
              label: "Book a detail",
              blurb: "Same calendar. Same driveway visit.",
            },
            {
              href: "/faq",
              label: "More questions",
              blurb: "Including where the 10% goes.",
            },
          ]}
        />
      </div>
    </>
  );
}
