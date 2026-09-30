import Link from "next/link";
import { IconMark } from "@/components/IconMark";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SuburbExplorer } from "@/components/SuburbExplorer";
import { REGIONS } from "@/lib/suburbs";
import { mapsSearchUrl } from "@/lib/thanks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Service areas",
  description:
    "Squeaky Solutions covers Greater Brisbane — inner, northside, southside, east and west. Check your suburb and open Maps to see the area.",
  path: "/areas",
});

const REGION_LABELS: Record<(typeof REGIONS)[number], string> = {
  "Inner Brisbane": "Inner Brisbane",
  Northside: "North side",
  Southside: "South side",
  East: "East side",
  West: "West side",
};

const REGION_QUERIES: Record<(typeof REGIONS)[number], string> = {
  "Inner Brisbane": "Inner Brisbane QLD",
  Northside: "Northside Brisbane QLD",
  Southside: "Southside Brisbane QLD",
  East: "East Brisbane QLD",
  West: "Western suburbs Brisbane QLD",
};

const REGION_BLURBS: Record<(typeof REGIONS)[number], string> = {
  "Inner Brisbane": "CBD, West End, New Farm, Paddington & more.",
  Northside: "Chermside, Ascot, The Gap & surrounds.",
  Southside: "Carindale, Camp Hill, Sunnybank & surrounds.",
  East: "Wynnum, Manly, Carina & surrounds.",
  West: "Toowong, Indooroopilly, Kenmore & surrounds.",
};

export default function AreasPage() {
  return (
    <>
      <PageMast
        title="Areas we cover"
        crumbs={[{ href: "/areas", label: "Areas" }]}
        width="wide"
        scene="areas"
      >
        <p>
          Suburb on the list? <Link href="/book">Book online</Link>. Not on it?
          Still <Link href="/contact">ask</Link> — if there are a few jobs
          nearby, we’ll often make the trip.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-6xl !pt-10">
        <section>
          <h2 className="font-display text-2xl font-semibold">Check your area</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Tap an area to see it on Google Maps.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li className="card p-4">
              <p className="font-semibold">Greater Brisbane</p>
              <p className="mt-1 text-sm text-ink-soft">
                We come to you. No shop, no drop-off.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={mapsSearchUrl("Brisbane QLD")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-fresh-deep underline"
                >
                  <IconMark name="map" className="h-4 w-4" />
                  Open map
                </a>
              </div>
            </li>
            {REGIONS.map((region) => (
              <li key={region} className="card p-4">
                <p className="font-semibold">{REGION_LABELS[region]}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {REGION_BLURBS[region]}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                  <Link
                    href={`/book`}
                    className="text-fresh-deep underline"
                  >
                    Book
                  </Link>
                  <a
                    href={mapsSearchUrl(REGION_QUERIES[region])}
                    target="_blank"
                    rel="noreferrer"
                    className="text-fresh-deep underline"
                  >
                    Map
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Find your suburb</h2>
          <div className="mt-5">
            <SuburbExplorer />
          </div>
        </div>

        <RelatedLinks
          links={[
            {
              href: "/book",
              label: "Book your suburb",
              blurb: "Pick a morning or afternoon window.",
            },
            {
              href: "/jobs",
              label: "Typical jobs",
              blurb: "West End small, Carindale medium, Wynnum large.",
            },
          ]}
        />
      </div>
    </>
  );
}
