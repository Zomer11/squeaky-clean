import Link from "next/link";
import { GiveBack } from "@/components/GiveBack";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { DONATION } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Donations",
  description:
    "Your detail, their meal — Squeaky Solutions donates 10% of every job toward Palestine, Sudan and Lebanon.",
  path: "/donation",
});

export default function DonationPage() {
  return (
    <>
      <PageMast
        title="Your detail, their meal."
        crumbs={[{ href: "/donation", label: "Donations" }]}
        scene="donation"
      >
        <p>
          {DONATION.percent}% of what we take goes toward Palestine, Sudan and
          Lebanon. It comes out of the job total — not an extra on your bill.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-3xl !pt-10">
        <GiveBack />

        <section className="mt-12 space-y-8">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Where the money goes
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Placeholder — we’ll name the receiving partners and causes here
              once they’re locked in. For now: {DONATION.percent}% of every paid
              job is set aside for relief toward Palestine, Sudan and Lebanon.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">How it works</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Placeholder — process notes go here. Rough shape: we total the
              month’s jobs, peel off {DONATION.percent}%, and send it on. You
              don’t add a tip line; it’s already in our cut.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold">
              Receipts & credibility
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Placeholder — once we have charity names, transfer records, or a
              public ledger, they live here. Need the recipient in writing
              before that?{" "}
              <Link
                href="/contact"
                className="font-semibold text-fresh-deep underline"
              >
                Ask us
              </Link>
              .
            </p>
          </div>
        </section>

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
