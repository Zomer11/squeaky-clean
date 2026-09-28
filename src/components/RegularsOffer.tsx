import Link from "next/link";
import { MiniWreath } from "@/components/LaurelField";
import { BUSINESS, LOYALTY, MAINTENANCE_COPY } from "@/lib/constants";

const STAMPS = Array.from({ length: LOYALTY.freeOn }, (_, i) => i + 1);

type Props = {
  compact?: boolean;
};

export function RegularsOffer({ compact = false }: Props) {
  return (
    <section
      id="regulars"
      className={compact ? "mt-16" : "section-pad mx-auto max-w-6xl"}
    >
      <div className="regulars-board">
        <div className="regulars-copy">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {LOYALTY.title}
          </h2>
          <p className="mt-3 max-w-md text-paper/88">{LOYALTY.lead}</p>
          <p className="mt-3 max-w-md text-sm text-sun-on-ink">{LOYALTY.how}</p>
          <ul className="regulars-offers">
            <li>
              <strong>Fifth Exterior Basic free</strong>
              <span>After four paid washes. Same vehicle size.</span>
            </li>
            <li>
              <strong>{MAINTENANCE_COPY.kicker}</strong>
              <span>
                Weekly, fortnightly or monthly — continuous value without the
                full-detail price each time.
              </span>
            </li>
          </ul>
          <p className="mt-4 max-w-md text-xs text-paper/65">{LOYALTY.limit}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-accent">
              Book a visit
            </Link>
            <Link
              href={MAINTENANCE_COPY.readMoreHref}
              className="btn btn-ghost"
            >
              Read more
            </Link>
          </div>
        </div>

        <div className="punch-card" aria-hidden>
          <MiniWreath className="punch-laurel" />
          <p className="punch-brand">{BUSINESS.name}</p>
          <p className="punch-sub">{LOYALTY.punchTitle}</p>
          <ol className="punch-row">
            {STAMPS.map((n) => (
              <li
                key={n}
                className={
                  n === LOYALTY.freeOn ? "punch-pip is-free" : "punch-pip"
                }
              >
                {n === LOYALTY.freeOn ? "Free" : n}
              </li>
            ))}
          </ol>
          <p className="punch-foot">{LOYALTY.punchFoot}</p>
        </div>
      </div>
    </section>
  );
}
