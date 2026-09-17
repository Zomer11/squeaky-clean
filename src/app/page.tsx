import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import { FaqList } from "@/components/FaqList";
import { NextAvailableStrip } from "@/components/NextAvailableStrip";
import { SqueakyDuck } from "@/components/SqueakyDuck";
import { BUSINESS, PRICING, estimatePrice } from "@/lib/constants";
import { FAQS } from "@/lib/faq";
import { TYPICAL_JOBS } from "@/lib/jobs";
import { pageMeta } from "@/lib/site";

const DrivewayScene3D = dynamic(
  () =>
    import("@/components/DrivewayScene3D").then((m) => m.DrivewayScene3D),
  {
    loading: () => (
      <div className="card min-h-[280px] animate-pulse bg-paper" aria-hidden />
    ),
  },
);

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
      "Squeaky Clean comes to your Brisbane driveway. Exterior, interior or full detail. Book morning or afternoon online, Sundays included. Pay on the day.",
    path: "/",
  }),
  title: {
    absolute: `${BUSINESS.name} | Brisbane mobile car detailing`,
  },
};

export default function HomePage() {
  const fromPrice = estimatePrice("exterior", "hatch", "one-off");

  return (
    <>
      <NextAvailableStrip />
      <section className="section-pad mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="chip hero-cta">Brisbane · mobile detailing</p>
            <h1 className="font-display hero-headline mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {BUSINESS.name}
              <span className="hero-line2 mt-1 text-fresh-deep">
                Your car. Your driveway.
              </span>
            </h1>
            <p className="hero-cta mt-5 max-w-xl text-lg text-ink-soft">
              {BUSINESS.tagline} Exterior, interior, or a full reset — we
              bring the kit to you. Sundays included.
            </p>
            <p className="hero-cta mt-3 text-sm font-semibold text-fresh-deep">
              Bookings confirm instantly. Inquiries: we aim to reply the same
              day.
            </p>
            <div className="hero-cta mt-7 flex flex-wrap items-center gap-3">
              <Link href="/book" className="btn btn-accent">
                Book a detail
              </Link>
              <Link href="/services" className="btn btn-ghost">
                See prices
              </Link>
              <SqueakyDuck size={56} mood="waddle" className="ml-1 hidden sm:block" />
            </div>
            <p className="hero-cta mt-4 text-sm text-ink-soft">
              {BUSINESS.payNote}
            </p>
          </div>
          <AnimateIn variant="scale" delay={120}>
            <div className="relative">
              <div className="pointer-events-none absolute -right-1 -top-6 z-10 sm:right-4 sm:top-1">
                <SqueakyDuck size={72} mood="bob" />
              </div>
              <div className="wash-sweep rounded-[inherit]">
                <DrivewayScene3D />
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      <section className="border-y border-line bg-paper/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-6">
          <AnimateIn>
            <DetailBeforeAfter />
          </AnimateIn>
          <div className="grid gap-6 sm:grid-cols-3">
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
                body: `Hatch exterior, one-off. ${PRICING.gstNote}`,
              },
            ].map((item, i) => (
              <AnimateIn key={item.title} delay={i * 90}>
                <h2 className="font-display text-xl font-semibold">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{item.body}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <AnimateIn>
            <h2 className="font-display text-3xl font-semibold">How a booking works</h2>
            <p className="mt-2 max-w-lg text-ink-soft">
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
        <div className="mt-8 grid gap-4 md:grid-cols-3" role="list">
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
            <AnimateIn key={s.n} delay={i * 110} className="h-full">
              <div className="card card-lift h-full p-5" role="listitem">
                <span className="step-num text-xs font-bold tracking-[0.2em] text-sun-deep">
                  {s.n}
                </span>
                <h3 className="font-display mt-2 text-xl font-semibold">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper/60">
        <div className="section-pad mx-auto max-w-6xl !py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-semibold">Typical driveway jobs</h2>
              <p className="mt-2 max-w-lg text-ink-soft">
                Composite write-ups — not fake reviews.{" "}
                <Link href="/jobs" className="font-semibold text-fresh-deep underline">
                  All three
                </Link>
                .
              </p>
            </div>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {TYPICAL_JOBS.map((job) => (
              <li key={job.id} className="card p-5">
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
        <h2 className="font-display text-3xl font-semibold">Before you book</h2>
        <p className="mt-2 max-w-lg text-ink-soft">
          Short answers. The rest lives on the{" "}
          <Link href="/faq" className="font-semibold text-fresh-deep underline">
            FAQ
          </Link>
          .
        </p>
        <div className="mt-6 max-w-3xl">
          <FaqList items={FAQS.slice(0, 4)} />
        </div>
        <AnimateIn delay={80}>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-6 py-6 text-paper">
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
