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
  MAINTENANCE_COPY,
  PACKAGES,
  PRICING,
  SIZES,
  estimatePrice,
} from "@/lib/constants";
import { PACKAGE_FAQS } from "@/lib/faq";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Our packages",
  description:
    "Squeaky Solutions driveway packages: Good, Better and Best, plus exterior, interior and a maintenance plan. Small, medium, large. Brisbane mobile.",
  path: "/services",
});

export default function ServicesPage() {
  const fromPrice = estimatePrice("interior-basic", "small", "one-off");
  const extrasNow = EXTRAS.filter((e) => !e.soon);

  return (
    <>
      <PageMast
        title="Our packages"
        kicker="Menu · priced by size"
        photo="/media/masts/services.jpg"
        photoPos="center 60%"
        crumbs={[{ href: "/services", label: "Packages" }]}
        width="wide"
        scene="services"
      >
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-fresh-deep">
          Best value · Best quality · Best in the business
        </p>
        <p className="mt-3">
          Three inside + outside bundles, or exterior / interior on their own.
          Small, medium, large. Interior Basic from ${fromPrice}.{" "}
          {PRICING.gstNote}
        </p>
        <p className="mt-3 text-sm">{PRICING.priceNote}</p>
      </PageMast>

      <div className="services-content section-pad mx-auto max-w-6xl !pt-10">
        <section className="services-showcase">
          <div className="price-with-gift mt-10">
            <div className="service-package-intro">
              <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                Good Better Best
              </h2>
              <p className="mt-3 max-w-xl text-xl font-semibold text-ink">
                Best in the industry, every time.
              </p>
              <p className="mt-2 max-w-xl text-lg text-ink-soft">
                Inside and outside in one visit. You pick the quality.
              </p>
              <ul className="service-package-promises">
                <li>We come to you</li>
                <li>Pay on the day</li>
                <li>Showroom finish</li>
              </ul>
              <GiveBack />
            </div>
          </div>
          <div className="mt-8 grid items-stretch gap-5 md:grid-cols-3">
            {COMBINED_PACKAGES.map((p) => (
              <PackageCard key={p.id} packageId={p.id} />
            ))}
          </div>

          <h2 className="font-display mt-16 text-3xl font-semibold">
            Other packages we offer
          </h2>
          <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">
            Just the outside, or just the inside. Not a bundle — pick the side,
            then Basic or Premium.
          </p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {EXTERIOR_PACKAGES.map((p) => (
              <PackageCard key={p.id} packageId={p.id} />
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {INTERIOR_PACKAGES.map((p) => (
            <PackageCard key={p.id} packageId={p.id} />
          ))}
        </div>

        <section id="maintenance" className="maintenance-feature mt-16 scroll-mt-28">
          <div className="maintenance-feature-intro loyalty-payoff rounded-3xl border border-line bg-paper/80 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-deep">
              {MAINTENANCE_COPY.kicker}
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold sm:text-4xl">
              {MAINTENANCE_COPY.title}
            </h2>
            <p className="mt-1 text-lg text-ink-soft">
              {MAINTENANCE_COPY.subtitle}
            </p>
            <p className="mt-4 max-w-xl text-sm text-ink-soft">
              {MAINTENANCE_COPY.boxBody}
            </p>
            <Link
              href={MAINTENANCE_COPY.readMoreHref}
              className="mt-5 inline-flex font-semibold text-fresh-deep underline"
            >
              Read more
            </Link>
          </div>
          <div className="maintenance-plan-card mt-8">
            <PackageCard
              packageId={
                PACKAGES.find((p) => p.id === "maintenance")?.id ??
                "maintenance"
              }
            />
          </div>
        </section>

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
        </section>

        <RegularsOffer compact />

        <section className="mt-16">
          <h2 className="font-display text-3xl font-semibold">
            Which size is your car?
          </h2>
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
          <h2 className="font-display text-3xl font-semibold">Quick questions</h2>
          <div className="mt-6">
            <FaqList items={PACKAGE_FAQS} />
          </div>
        </section>

        <p className="mt-10 max-w-2xl text-sm text-ink-soft">
          Fleet, boat or something a bit different? Just{" "}
          <Link href="/contact" className="font-semibold text-fresh-deep underline">
            ask
          </Link>
          . We don’t offer machine polishing or long-term ceramic coatings yet.
        </p>
        <RelatedLinks
          links={[
            {
              href: "/book",
              label: "Book a time",
              blurb: "Mornings or arvos. Sundays too.",
            },
            {
              href: "/faq",
              label: "More questions",
              blurb: "Pets, hose access, cancelling, suburbs & our 10% donation.",
            },
          ]}
        />
      </div>
    </>
  );
}
