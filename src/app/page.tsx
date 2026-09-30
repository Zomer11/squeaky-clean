import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import { FaqList } from "@/components/FaqList";
import { GiveBack } from "@/components/GiveBack";
import { GoogleReviews } from "@/components/GoogleReviews";
import { HeroCrest } from "@/components/HeroCrest";
import { NextAvailableStrip } from "@/components/NextAvailableStrip";
import { PhotoReel } from "@/components/PhotoReel";
import { RegularsOffer } from "@/components/RegularsOffer";
import {
  BUSINESS,
  COMBINED_PACKAGES,
  estimatePrice,
} from "@/lib/constants";
import { HOME_FAQS } from "@/lib/faq";
import { TYPICAL_JOBS } from "@/lib/jobs";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Brisbane mobile car detailing",
    description:
      "Squeaky Solutions comes to your Brisbane driveway. Want it squeaky clean? Book morning or afternoon online, Sundays included. Pay on the day.",
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
              <p className="hero-cta text-sm font-semibold uppercase tracking-[0.16em] text-sun-on-ink">
                Want it squeaky clean?
              </p>
              <h1 className="font-display hero-headline mt-3 text-[2.4rem] font-semibold leading-[1.02] tracking-tight text-paper sm:text-5xl lg:text-6xl">
                Meet {BUSINESS.name}.
                <span className="hero-line2 mt-1 block">
                  Reborn your car.
                </span>
              </h1>
              <p className="hero-cta mt-5 max-w-xl text-lg text-paper/80">
                Your car reborn. At your driveway. Exterior, interior, or a full
                reset. Sundays included.
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
              {/* Pay-on-day kept for now — prepay / remove is a deferred conflict */}
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
            { title: "We come to you" },
            { title: "Best prices, best results" },
            { title: `As cheap as $${fromPrice}` },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-display text-xl font-semibold text-paper">
                {item.title}
              </h2>
            </div>
          ))}
        </div>
      </section>
      <PhotoReel />

      <section className="packages-band">
        <div className="section-pad mx-auto max-w-6xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Good Better Best
          </h2>
          <p className="mt-2 text-lg font-semibold text-ink">
            Best in the industry, every time.
          </p>
          <p className="mt-3 max-w-lg text-ink-soft">
            Inside and outside in one visit. Exterior-only, interior-only, and a
            maintenance plan live on{" "}
            <Link
              href="/services"
              className="font-semibold text-fresh-deep underline"
            >
              our packages
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

      <figure className="wash-plate">
        <Image
          src="/media/suds-white.jpg"
          alt="White coupe foamed on an outdoor apron"
          fill
          sizes="100vw"
          className="object-cover"
        />
      </figure>

      <RegularsOffer />

      <div className="home-ink-band">
      <section className="section-pad mx-auto max-w-6xl">
        <AnimateIn>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            How a booking works
          </h2>
          <p className="mt-3 max-w-lg text-ink-soft">
            Book a slot. Leave the car home. We wash it where it sits.
          </p>
        </AnimateIn>
        <div
          className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-3 md:gap-0"
          role="list"
        >
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
                <h3 className="font-display mt-3 text-xl font-semibold">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="section-pad mx-auto max-w-6xl !py-16">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Typical driveway jobs
          </h2>
          <p className="mt-3 max-w-lg text-ink-soft">
            Composite write-ups — not fake reviews.{" "}
            <Link
              href="/jobs"
              className="font-semibold text-fresh-deep underline"
            >
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
                <h3 className="font-display mt-2 text-xl font-semibold">
                  {job.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{job.story}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GoogleReviews />

      <section className="section-pad mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">
          Most common questions
        </h2>
        <p className="mt-3 max-w-lg text-ink-soft">
          <Link href="/faq" className="font-semibold text-fresh-deep underline">
            Read more
          </Link>{" "}
          on the full FAQ.
        </p>
        <div className="mt-6 max-w-3xl">
          <FaqList items={HOME_FAQS} />
        </div>
        <AnimateIn delay={80}>
          <div className="cabin-close">
            <Image
              src="/media/suds-interior.jpg"
              alt="Foam on the windscreen, seen from the driver’s seat"
              fill
              sizes="(min-width: 72rem) 72rem, 100vw"
              className="object-cover"
            />
            <div className="cabin-close-copy">
              <p className="font-display text-2xl font-semibold">
                Ready when the car is.
              </p>
              <p className="mt-1 text-sm text-paper/80">
                Live calendar · 7 days · AM/PM · Greater Brisbane
              </p>
              <Link href="/book" className="btn btn-accent mt-5">
                Book a time
              </Link>
            </div>
          </div>
        </AnimateIn>
      </section>
      </div>
    </>
  );
}
