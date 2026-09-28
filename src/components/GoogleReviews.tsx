import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import {
  GOOGLE_REVIEWS,
  hasCuratedReviews,
  hasGoogleMapsLink,
  hasGoogleReviewLink,
  hasPublishedRating,
} from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <span className="tracking-wide text-sun-deep" aria-label={`${full} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-ink-soft/40">{"★".repeat(5 - full)}</span>
    </span>
  );
}

type Props = {
  /** Compact strip for thanks / footer contexts */
  variant?: "section" | "compact";
};

export function GoogleReviews({ variant = "section" }: Props) {
  const reviewLink = hasGoogleReviewLink();
  const mapsLink = hasGoogleMapsLink();
  const curated = hasCuratedReviews();
  const rating = hasPublishedRating();

  if (variant === "compact") {
    if (!reviewLink && !mapsLink) return null;
    return (
      <p className="text-sm text-ink-soft">
        {reviewLink ? (
          <>
            Happy with the job?{" "}
            <a
              href={BUSINESS.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-fresh-deep underline"
            >
              Leave a Google review
            </a>
            {mapsLink ? " · " : null}
          </>
        ) : null}
        {mapsLink ? (
          <a
            href={BUSINESS.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-fresh-deep underline"
          >
            Find us on Google
          </a>
        ) : null}
      </p>
    );
  }

  return (
    <section className="section-pad mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Google reviews
          </h2>
          <p className="mt-3 max-w-lg text-ink-soft">
            {curated
              ? "Real customer quotes from Google. We don’t invent testimonials."
              : "Reviews live on Google Business. Once the listing is verified and people leave ratings, they show up here."}
          </p>
          {rating ? (
            <p className="mt-3 text-sm font-semibold text-ink">
              <Stars rating={BUSINESS.googleRating} />{" "}
              {BUSINESS.googleRating.toFixed(1)} · {BUSINESS.googleReviewCount}{" "}
              Google review{BUSINESS.googleReviewCount === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {reviewLink ? (
            <a
              href={BUSINESS.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent"
            >
              Leave a review
            </a>
          ) : null}
          {mapsLink ? (
            <a
              href={BUSINESS.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Open on Google
            </a>
          ) : (
            <Link href="/contact" className="btn btn-ghost">
              Ask us anything
            </Link>
          )}
        </div>
      </div>

      {curated ? (
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {GOOGLE_REVIEWS.map((r) => (
            <li
              key={`${r.name}-${r.when ?? r.quote.slice(0, 24)}`}
              className="border-t border-line pt-5"
            >
              <Stars rating={r.rating} />
              <p className="mt-3 text-sm leading-relaxed text-ink">“{r.quote}”</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-fresh-deep">
                {r.name}
                {r.suburb ? ` · ${r.suburb}` : ""}
                {r.when ? ` · ${r.when}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-cream/40 px-5 py-6 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Listing not linked yet</p>
          <p className="mt-2 max-w-xl">
            Create the Google Business Profile, paste{" "}
            <code className="text-xs">googleReviewUrl</code> /{" "}
            <code className="text-xs">googleMapsUrl</code> in{" "}
            <code className="text-xs">src/lib/constants.ts</code>, then add real
            quotes to <code className="text-xs">src/lib/reviews.ts</code>.
          </p>
        </div>
      )}
    </section>
  );
}
