import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import { FaqList } from "@/components/FaqList";
import { GiveBack } from "@/components/GiveBack";
import { HeroCrest } from "@/components/HeroCrest";
import { NextAvailableStrip } from "@/components/NextAvailableStrip";
import { PhotoRibbon } from "@/components/PhotoRibbon";
import { RegularsOffer } from "@/components/RegularsOffer";
import { BUSINESS, COMBINED_PACKAGES, PRICING, estimatePrice } from "@/lib/constants";
import { HOME_FAQS } from "@/lib/faq";
import { TYPICAL_JOBS } from "@/lib/jobs";
import { pageMeta } from "@/lib/site";

const DetailBeforeAfter = dynamic(
  () =>
    import("@/components/DetailBeforeAfter").then((m) => m.DetailBeforeAfter),
  {
    loading: () => (
      <div className="card min-h-[220px] animate-pulse bg-paper" aria-hidden />
    ),
  },
);

const DetailCar3D = dynamic(
  () => import("@/components/DetailCar3D").then((m) => m.DetailCar3D),
  { loading: () => <div className="h-20" aria-hidden /> },
);

export const metadata: Metadata = {
  ...pageMeta({
    title: "Brisbane mobile car detailing",
    description:
      "Squeaky Solutions comes to your Brisbane driveway. Inside + outside bundles, or exterior / interior only. Book morning or afternoon online, Sundays included. Pay on the day.",
    path: "/",
  }),
  title: {
    absolute: `${BUSINESS.name} | Brisbane mobile car detailing`,
  },
};

export default function HomePage() {
  const fromPrice = estimatePrice("good", "small", "one-off");

  return (
    <>
      <NextAvailableStrip />
      <section className="salon-hero">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
            <div>
              <h1 className="font-display hero-headline text-[2.4rem] font-semibold leading-[1.02] tracking-tight text-paper sm:text-5xl lg:text-6xl">
                Showroom finish.
                <span className="hero-line2 mt-1 block">Your driveway.</span>
              </h1>
              <p className="hero-cta mt-5 max-w-xl text-lg text-paper/80">
                {BUSINESS.name} brings the kit to you. Exterior, interior, or a
                full reset. Sundays included.
              </p>
              <p className="hero-cta mt-3 text-sm font-semibold text-sun-on-ink">
                Bookings confirm instantly. Inquiries: we aim to reply the same
                day.
              </p>
              <div className="hero-cta mt-6 flex flex-wrap items-center gap-3">
                <Link href="/book" className="btn btn-accent">
                  Book a detail
                </Link>
                <Link href="/services" className="btn btn-ghost">
                  See prices
                </Link>
              </div>
              <p className="hero-cta mt-4 text-sm text-paper/65">
                {BUSINESS.payNote}
              </p>
            </div>
            <AnimateIn variant="scale" delay={80}>
              <HeroCrest />
            </AnimateIn>
          </div>
        </div>
        <div className="salon-facts">
          {[
            {
              title: "We come to you",
              body: "Hose tap and a bit of driveway space. That’s the setup.",
            },
            {
              title: "Insured local run",
              body: "One operator, Brisbane suburbs, no franchise script.",
            },
            {
              title: `From $${fromPrice}`,
              body: `The Essentials, small car. ${PRICING.gstNote}`,
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-xl font-semibold text-paper">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-paper/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <PhotoRibbon />

      <section className="packages-band">
        <div className="section-pad mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            3 package deals
          </h2>
          <p className="mt-3 max-w-lg text-paper/70">
            Good, Better, Best — inside and outside in one visit. Exterior-only,
            interior-only, and a maintenance plan live on the{" "}
            <Link href="/services" className="font-semibold text-sun-on-ink underline">
              inclusions list
            </Link>
            .
          </p>
          <div className="price-with-gift">
            <ul className="salon-menu">
              {COMBINED_PACKAGES.map((pkg) => (
                <li key={pkg.id}>
                  <Link href={`/services#${pkg.id}`}>
                    <span className="copy">
                      <span className="grade">{pkg.grade}</span>
                      <span className="name">{pkg.label}</span>
                    </span>
                    <span className="rule" aria-hidden />
                    <span className="price">From ${pkg.prices.small}</span>
                  </Link>
                  <p className="blurb">{pkg.blurb}</p>
                </li>
              ))}
            </ul>
            <GiveBack />
          </div>
        </div>
      </section>

      <RegularsOffer />

      <section className="section-pad mx-auto max-w-6xl !pt-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <AnimateIn>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              How a booking works
            </h2>
            <p className="mt-3 max-w-lg text-ink-soft">
              Book a slot. Leave the car home. We wash it where it sits.
            </p>
          </AnimateIn>
          <AnimateIn delay={100} variant="scale">
            <div className="flex items-end gap-1" aria-hidden>
              <DetailCar3D vehicle="hatch" size="sm" />
              <DetailCar3D vehicle="sedan" size="sm" />
              <DetailCar3D vehicle="suv" size="sm" />
            </div>
          </AnimateIn>
        </div>
        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-3 md:gap-0" role="list">
          {[
            {
              n: "01",
              t: "Book the driveway",
              d: "Pick the car, the package, and a morning or afternoon window.",
            },
            {
              n: "02",
              t: "We roll up",
              d: "Need a hose tap and room to work. Dogs in, keys sorted.",
            },
            {
              n: "03",
              t: "Pay on the day",
              d: "Cash or card when we finish. No online lock-in.",
            },
          ].map((s, i) => (
            <AnimateIn
              key={s.n}
              delay={i * 110}
              className={`h-full md:px-6 ${i > 0 ? "md:border-l md:border-line" : "md:pl-0"}`}
            >
              <div role="listitem">
                <span className="step-num text-xs font-bold tracking-[0.2em] text-sun-deep">
                  {s.n}
                </span>
                <h3 className="font-display mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
        <div className="mt-12 max-w-xl">
          <AnimateIn>
            <DetailBeforeAfter />
          </AnimateIn>
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="section-pad mx-auto max-w-6xl !py-16">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Typical driveway jobs
          </h2>
          <p className="mt-3 max-w-lg text-ink-soft">
            Composite write-ups — not fake reviews.{" "}
            <Link href="/jobs" className="font-semibold text-fresh-deep underline">
              All three
            </Link>
            .
          </p>
          <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {TYPICAL_JOBS.map((job) => (
              <li key={job.id} className="border-t border-line pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-fresh-deep">
                  {job.suburb}
                </p>
                <h3 className="font-display mt-2 text-xl font-semibold">{job.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{job.story}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Before you book
        </h2>
        <p className="mt-3 max-w-lg text-ink-soft">
          Short answers. The rest lives on the{" "}
          <Link href="/faq" className="font-semibold text-fresh-deep underline">
            FAQ
          </Link>
          .
        </p>
        <div className="mt-6 max-w-3xl">
          <FaqList items={HOME_FAQS} />
        </div>
        <AnimateIn delay={80}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-[1.15rem] bg-ink px-6 py-7 text-paper">
            <div>
              <p className="font-display text-2xl font-semibold">
                Ready when the car is.
              </p>
              <p className="mt-1 text-sm text-paper/70">
                Live calendar · 7 days · AM/PM · Greater Brisbane
              </p>
            </div>
            <Link href="/book" className="btn btn-accent">
              Open calendar
            </Link>
          </div>
        </AnimateIn>
      </section>
    </>
  );
}
