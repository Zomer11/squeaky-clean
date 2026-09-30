import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { BUSINESS, LOYALTY, MAINTENANCE_COPY } from "@/lib/constants";

const STAMPS = Array.from({ length: LOYALTY.stampCount }, (_, i) => i + 1);

function stampLabel(n: number) {
  const pct = LOYALTY.discounts[n];
  return pct ? `${pct}%` : String(n);
}

function stampClass(n: number) {
  if (LOYALTY.discounts[n] === 50) return "punch-pip is-deal is-deal-big";
  if (LOYALTY.discounts[n]) return "punch-pip is-deal";
  return "punch-pip";
}

type Props = {
  compact?: boolean;
};

export function RegularsOffer({ compact = false }: Props) {
  return (
    <section
      id="regulars"
      className={compact ? "regulars-section regulars-section--compact" : "regulars-section"}
    >
      <div className={compact ? "regulars-board" : "regulars-board section-pad mx-auto max-w-6xl"}>
        <div className="regulars-copy">
          <p className="regulars-kicker">{LOYALTY.kicker}</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {LOYALTY.title}
          </h2>
          <div className="regulars-lead">
            {LOYALTY.leadLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="regulars-how">{LOYALTY.how}</p>

          <ul className="regulars-offers">
            <li>
              <strong>{LOYALTY.offerTitle}</strong>
              <span>{LOYALTY.offerBody}</span>
            </li>
          </ul>

          <div className="regulars-plan">
            <p className="regulars-plan-kicker">{MAINTENANCE_COPY.kicker}</p>
            <h3 className="font-display text-xl font-semibold sm:text-2xl">
              {MAINTENANCE_COPY.title}
            </h3>
            <p className="regulars-body">{MAINTENANCE_COPY.boxBody}</p>
            <Link
              href={MAINTENANCE_COPY.readMoreHref}
              className="regulars-link"
            >
              {MAINTENANCE_COPY.readMoreLabel}
            </Link>
          </div>

          <div className="regulars-join">
            <h3 className="font-display text-xl font-semibold sm:text-2xl">
              {LOYALTY.memberTitle}
            </h3>
            <p className="regulars-body">{LOYALTY.memberLead}</p>
            <p className="regulars-limit">{LOYALTY.limit}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-accent">
                {LOYALTY.memberCta}
              </Link>
              <Link href="/book" className="btn btn-ghost">
                Book a visit
              </Link>
            </div>
          </div>
        </div>

        <div className="punch-card" aria-hidden>
          <div className="punch-card-shine" />
          <BrandMark size={52} className="punch-logo" />
          <p className="punch-brand">{BUSINESS.name}</p>
          <p className="punch-sub">{LOYALTY.punchTitle}</p>
          <p className="punch-member">Member · free to join</p>

          <ol className="punch-row">
            {STAMPS.map((n) => (
              <li key={n} className={stampClass(n)}>
                <span className="punch-pip-num">{stampLabel(n)}</span>
                <span className="punch-pip-cap">
                  {LOYALTY.discounts[n] ? "off" : "wash"}
                </span>
              </li>
            ))}
          </ol>

          <div className="punch-cause">
            <p className="punch-foot">{LOYALTY.punchFoot}</p>
            <p className="punch-cause-note">{LOYALTY.punchCause}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
