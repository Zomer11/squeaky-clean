import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { GiveBack } from "@/components/GiveBack";
import { PackageCard } from "@/components/PackageCard";
import { PageMast } from "@/components/PageMast";
import { RegularsOffer } from "@/components/RegularsOffer";
import { RelatedLinks } from "@/components/RelatedLinks";
import {
  COMBINED_PACKAGES,
  EXTERIOR_PACKAGES,
  EXTRAS,
  INTERIOR_PACKAGES,
  PACKAGES,
  PRICING,
  SIZES,
  estimatePrice,
} from "@/lib/constants";
import { PACKAGE_FAQS } from "@/lib/faq";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Detailing packages",
  description:
    "Squeaky Solutions driveway packages: The Essentials, Full Detail and Full Treatment, plus exterior, interior and a maintenance plan. Small, medium, large. Brisbane mobile.",
  path: "/services",
});

export default function ServicesPage() {
  const fromPrice = estimatePrice("interior-basic", "small", "one-off");
  const extrasNow = EXTRAS.filter((e) => !e.soon);
  const extrasSoon = EXTRAS.filter((e) => e.soon);

  return (
    <>
      <PageMast
        title="Detailing packages"
        crumbs={[{ href: "/services", label: "Packages" }]}
        width="wide"
      >
        <p>
          Three inside + outside bundles, or exterior / interior on their own.
          Small,
          medium, large. Interior Basic from ${fromPrice}. {PRICING.gstNote}
        </p>
        <p className="mt-3 text-sm">{PRICING.priceNote}</p>
      </PageMast>

      <div className="section-pad mx-auto max-w-6xl !pt-10">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.12em] text-fresh-deep">
          <li>We come to you</li>
          <li>Pay on the day</li>
          <li>No shop drop-off</li>
        </ul>

        <div className="price-with-gift mt-12">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              Inside + outside bundles
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Both sides in one visit. Good, Better, Best — you pick the quality.
              This is the card we want most people on.
            </p>
          </div>
          <GiveBack />
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {COMBINED_PACKAGES.map((p) => (
            <PackageCard key={p.id} packageId={p.id} />
          ))}
        </div>

        <h2 className="font-display mt-16 text-3xl font-semibold">
          One side only
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Just the outside, or just the inside. Not a bundle — pick the side,
          then Basic or Premium.
        </p>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {[...EXTERIOR_PACKAGES, ...INTERIOR_PACKAGES].map((p) => (
            <PackageCard key={p.id} packageId={p.id} />
          ))}
        </div>

        <h2 className="font-display mt-16 text-3xl font-semibold">
          Maintenance plan
        </h2>
        <p className="mt-2 max-w-xl text-sm text-ink-soft">
          Standing slot after a proper detail. Weekly, fortnightly or monthly.
        </p>
        <div className="mt-8 max-w-2xl">
          <PackageCard
            packageId={
              PACKAGES.find((p) => p.id === "maintenance")?.id ?? "maintenance"
            }
          />
        </div>

        <section className="mt-16">
          <h2 className="font-display text-3xl font-semibold">Add-ons</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Must sit on a package — we don’t book extras alone. Quoted on the
            drive if the car isn’t as described.
          </p>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {extrasNow.map((extra) => (
              <li
                key={extra.label}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <span>
                  <span className="font-semibold">{extra.label}</span>
                  <span className="ml-2 text-sm text-ink-soft">{extra.note}</span>
                </span>
                <span className="font-semibold">{extra.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm font-semibold">Coming soon — not bookable yet</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {extrasSoon.map((extra) => (
              <li
                key={extra.label}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-ink-soft"
              >
                <span>
                  <span className="font-semibold text-ink">{extra.label}</span>
                  <span className="ml-2 text-sm">{extra.note}</span>
                </span>
                <span>{extra.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-soft">
            Window tinting is a separate trade. We don’t do it.
          </p>
        </section>

        <RegularsOffer compact />

        <section className="mt-16">
          <h2 className="font-display text-3xl font-semibold">Vehicle size</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {SIZES.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-line bg-paper p-5"
              >
                <h3 className="font-semibold">{v.label}</h3>
                <p className="mt-1 text-sm text-ink-soft">{v.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="font-display text-3xl font-semibold">Package questions</h2>
          <div className="mt-6">
            <FaqList items={PACKAGE_FAQS} />
          </div>
        </section>

        <p className="mt-10 max-w-2xl text-sm text-ink-soft">
          Fleet, boats, or something weirder —{" "}
          <Link href="/contact" className="font-semibold text-fresh-deep underline">
            ask
          </Link>
          . Machine polish and a multi-year ceramic aren’t on this card yet.
        </p>
        <RelatedLinks
          links={[
            {
              href: "/book",
              label: "Open the calendar",
              blurb: "Morning or afternoon, including Sunday.",
            },
            {
              href: "/faq",
              label: "The rest of the FAQ",
              blurb: "Dogs, hose, cancel window, suburbs, the ten percent.",
            },
          ]}
        />
      </div>
    </>
  );
}
