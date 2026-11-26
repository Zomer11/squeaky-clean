import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { GoogleReviews } from "@/components/GoogleReviews";
import { NextAvailableStrip } from "@/components/NextAvailableStrip";
import { PackagePicker } from "@/components/PackagePicker";
import { Reveal } from "@/components/Reveal";
import { WashHero } from "@/components/WashHero";
import { BUSINESS, DONATION, LOYALTY, MAINTENANCE_COPY, estimatePrice } from "@/lib/constants";
import { HOME_FAQS } from "@/lib/faq";
import { TYPICAL_JOBS } from "@/lib/jobs";
import { CRAFT_TILES } from "@/lib/photos";
import { hasCuratedReviews, hasPublishedRating } from "@/lib/reviews";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Brisbane mobile car detailing",
    description:
      "Auto Care Detailing comes to your Brisbane driveway. Want it spotless? Book morning or afternoon online, Sundays included. Pay on the day.",
    path: "/",
  }),
  title: {
    absolute: `${BUSINESS.name} | Brisbane mobile car detailing`,
  },
};

const TICKER = [
  "We come to you",
  "Best prices, best results",
  "Sundays included",
  "Pay on the day",
  "10% of every job donated",
  "Morning or afternoon",
  "Insured",
  "Inside + out",
];

const FLAGS = [
  { src: "/media/flags/palestine.svg", name: "Palestine" },
  { src: "/media/flags/sudan.svg", name: "Sudan" },
  { src: "/media/flags/lebanon.svg", name: "Lebanon" },
];

const STEPS = [
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
];

export default function HomePage() {
  const fromPrice = estimatePrice("good", "small", "one-off");
  const showReviews = hasCuratedReviews() || hasPublishedRating();
  const stamps = Array.from({ length: LOYALTY.stampCount }, (_, i) => i + 1);

  return (
    <>
      <WashHero fromPrice={fromPrice} />

      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>
              {t}
              <i />
            </span>
          ))}
        </div>
      </div>

      <NextAvailableStrip />

      {/* ---------- packages ---------- */}
      <section id="packages" className="sect">
        <div className="wrap">
          <Reveal className="sect-head">
            <p className="eyebrow">As cheap as ${fromPrice}</p>
            <h2 className="sect-title">
              Good Better Best
              <br />
              <span className="dim">Best in the industry, every time.</span>
            </h2>
            <p className="sect-lede">
              Inside and outside in one visit. Exterior-only, interior-only, and
              a maintenance plan live on{" "}
              <Link href="/services" className="text-link">our packages</Link>.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <PackagePicker />
          </Reveal>
          <p className="tier-foot">
            Only need one side?{" "}
            <Link href="/services#exterior">Exterior only</Link> ·{" "}
            <Link href="/services#interior">Interior only</Link> ·{" "}
            <Link href="/services#maintenance">Maintenance plan</Link>
          </p>
        </div>
      </section>

      {/* ---------- donation ---------- */}
      <section className="give" aria-labelledby="give-title">
        <div className="wrap give-grid">
          <Reveal className="give-num" aria-hidden>
            <span>{DONATION.percent}</span>
            <sup>%</sup>
          </Reveal>
          <Reveal delay={100}>
            <p className="eyebrow">Donation · Palestine · Sudan · Lebanon</p>
            <h2 id="give-title" className="sect-title">
              {DONATION.percent}% donated every job
              <br />
              <span className="dim">{DONATION.tagline}</span>
            </h2>
            <p className="sect-lede">{DONATION.lead}</p>
            <ul className="give-flags">
              {FLAGS.map((f) => (
                <li key={f.name}>
                  <img src={f.src} alt="" width={36} height={24} />
                  {f.name}
                </li>
              ))}
            </ul>
            <Link href="/donation" className="text-link">
              How the donation works →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- craft ---------- */}
      <section className="sect">
        <div className="wrap">
          <Reveal className="sect-head">
            <p className="eyebrow">The details</p>
            <h2 className="sect-title">
              The bits other washes
              <br />
              <span className="dim">skip.</span>
            </h2>
          </Reveal>
          <div className="craft">
            {CRAFT_TILES.slice(0, 3).map((t, i) => (
              <Reveal key={t.src} delay={i * 90} className="craft-tile">
                <div className="craft-img">
                  <Image
                    src={t.src}
                    alt={t.alt}
                    fill
                    sizes="(min-width: 64rem) 33vw, 100vw"
                    style={{ objectPosition: t.pos }}
                    className="object-cover"
                  />
                </div>
                <p className="craft-n">{String(i + 1).padStart(2, "0")}</p>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="sect sect--line">
        <div className="wrap">
          <Reveal className="sect-head">
            <p className="eyebrow">Three steps</p>
            <h2 className="sect-title">How a booking works</h2>
            <p className="sect-lede">
              Book a slot. Leave the car home. We wash it where it sits.
            </p>
          </Reveal>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 100}>
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- loyalty ---------- */}
      <section className="sect">
        <div className="wrap loyal">
          <Reveal>
            <p className="eyebrow">{LOYALTY.kicker}</p>
            <h2 className="sect-title">
              {LOYALTY.title}
              <br />
              <span className="dim">{LOYALTY.leadLines[0]}</span>
            </h2>
            <p className="sect-lede">
              Stick with us, and it shows. {LOYALTY.leadLines[2]}
            </p>
            <p className="sect-lede">
              <strong>{LOYALTY.offerTitle}.</strong> {LOYALTY.offerBody}
            </p>
            <p className="sect-lede">{LOYALTY.how}</p>
            <div className="loyal-plan">
              <p className="eyebrow">{MAINTENANCE_COPY.kicker}</p>
              <h3>{MAINTENANCE_COPY.title}</h3>
              <p>{MAINTENANCE_COPY.subtitle}. {MAINTENANCE_COPY.boxBody}</p>
              <Link href={MAINTENANCE_COPY.readMoreHref} className="text-link">
                {MAINTENANCE_COPY.readMoreLabel} →
              </Link>
            </div>
            <h3 className="loyal-join">{LOYALTY.memberTitle}</h3>
            <p className="sect-lede">Become a member for free so it&rsquo;s easier to stamp.</p>
            <div className="loyal-actions">
              <Link href="/contact" className="btn btn-accent">
                {LOYALTY.memberCta}
              </Link>
              <Link href="/book" className="btn btn-ghost">
                Book a visit
              </Link>
            </div>
            <p className="fine">{LOYALTY.limit}</p>
          </Reveal>
          <Reveal delay={120} className="loyal-card" aria-label="Loyalty card preview">
            <div className="loyal-card-top">
              <span className="loyal-brand">
                Auto Care
                <br />
                Detailing
              </span>
              <span className="loyal-chip">Member · free</span>
            </div>
            <div className="loyal-stamps">
              {stamps.map((n) => {
                const off = LOYALTY.discounts[n];
                return (
                  <span key={n} className={`stamp ${off ? "is-reward" : ""}`}>
                    {off ? (
                      <>
                        <b>{off}%</b>
                        <small>off</small>
                      </>
                    ) : (
                      <>
                        <b>{n}</b>
                        <small>wash</small>
                      </>
                    )}
                  </span>
                );
              })}
            </div>
            <p className="loyal-foot">Exterior Basic · same size car</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- jobs ---------- */}
      <section className="sect sect--line">
        <div className="wrap">
          <Reveal className="sect-head sect-head--row">
            <div>
              <p className="eyebrow">Typical driveway jobs</p>
              <h2 className="sect-title">What a visit looks like.</h2>
            </div>
            <Link href="/jobs" className="text-link">
              All jobs →
            </Link>
          </Reveal>
          <div className="jobs">
            {TYPICAL_JOBS.slice(0, 3).map((j, i) => (
              <Reveal as="article" key={j.id} delay={i * 90} className="job">
                <div className="job-img">
                  <Image
                    src={j.photo}
                    alt=""
                    fill
                    sizes="(min-width: 64rem) 33vw, 100vw"
                    className="object-cover"
                  />
                  <span className="job-tag">{j.suburb}</span>
                </div>
                <h3>{j.title}</h3>
                <p>{j.story}</p>
                <p className="job-meta">{j.window}</p>
              </Reveal>
            ))}
          </div>
          <p className="fine mt-6">
            Composite write-ups of typical jobs, not customer reviews.
          </p>
        </div>
      </section>

      {showReviews && <GoogleReviews />}

      {/* ---------- faq ---------- */}
      <section className="sect sect--line">
        <div className="wrap faq-wrap">
          <Reveal>
            <h2 className="sect-title">Most common questions</h2>
            <p className="sect-lede">
              <Link href="/faq" className="text-link">Read more</Link> on the full FAQ.
            </p>
          </Reveal>
          <div>
            <FaqList items={HOME_FAQS} />
          </div>
        </div>
      </section>

      {/* ---------- final cta ---------- */}
      <section className="final">
        <Image
          src="/media/suds-interior.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="final-shade" />
        <Reveal className="wrap final-copy">
          <p className="eyebrow">Live calendar · 7 days · AM/PM · Greater Brisbane</p>
          <h2 className="final-title">
            Ready when
            <br />
            the car is.
          </h2>
          <div className="loyal-actions">
            <Link href="/book" className="btn btn-accent btn-lg">
              Book a time
            </Link>
            <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`} className="btn btn-ghost btn-lg">
              Call {BUSINESS.phone}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
