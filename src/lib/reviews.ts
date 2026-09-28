import { BUSINESS } from "@/lib/constants";

export type GoogleReview = {
  /** First name or initials only — keep it light. */
  name: string;
  /** Suburb if they mentioned one; optional. */
  suburb?: string;
  /** 1–5 */
  rating: number;
  /** Short quote copied from a real Google review. */
  quote: string;
  /** YYYY-MM optional */
  when?: string;
};

/**
 * Curated Google reviews shown on the site.
 * Copy real quotes from your Google Business Profile — do not invent them.
 * Leave empty until you have verified reviews to paste.
 */
export const GOOGLE_REVIEWS: GoogleReview[] = [
  // Example once you have real ones:
  // {
  //   name: "Sam",
  //   suburb: "Paddington",
  //   rating: 5,
  //   quote: "Rolled up on time, car looked brand new. Easy booking.",
  //   when: "2026-08",
  // },
];

export function hasGoogleReviewLink(): boolean {
  return BUSINESS.googleReviewUrl.trim().length > 0;
}

export function hasGoogleMapsLink(): boolean {
  return BUSINESS.googleMapsUrl.trim().length > 0;
}

export function hasPublishedRating(): boolean {
  return (
    BUSINESS.googleReviewCount > 0 &&
    BUSINESS.googleRating >= 1 &&
    BUSINESS.googleRating <= 5
  );
}

export function hasCuratedReviews(): boolean {
  return GOOGLE_REVIEWS.length > 0;
}
