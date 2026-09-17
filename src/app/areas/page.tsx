import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { IconMark } from "@/components/IconMark";
import { RelatedLinks } from "@/components/RelatedLinks";
import { SuburbExplorer } from "@/components/SuburbExplorer";
import { REGIONS } from "@/lib/suburbs";
import { mapsDirectionsUrl, mapsSearchUrl } from "@/lib/thanks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Service areas",
  description:
    "Squeaky Clean covers Greater Brisbane — inner, northside, southside, east and west. Check your suburb and open maps for directions.",
  path: "/areas",
});

const REGION_QUERIES: Record<(typeof REGIONS)[number], string> = {
  "Inner Brisbane": "Inner Brisbane QLD",
  Northside: "Northside Brisbane QLD",
  Southside: "Southside Brisbane QLD",
  East: "East Brisbane QLD",
  West: "Western suburbs Brisbane QLD",
};

export default function AreasPage() {
  return (
    <div className="section-pad mx-auto max-w-6xl">
      <Breadcrumbs items={[{ href: "/areas", label: "Areas" }]} />
      <p className="chip">Greater Brisbane</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Where we run
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        If your suburb is on the list, you can{" "}
        <Link href="/book" className="font-semibold text-fresh-deep underline">
          book a driveway detail
        </Link>{" "}
        online. Outside the list — still{" "}
        <Link href="/contact" className="font-semibold text-fresh-deep underline">
          ask
        </Link>
        ; we sometimes stretch for a cluster of jobs.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold">Maps & directions</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          We don’t embed Google Maps on this site. These open Maps in a new
          tab so you can see the suburb or get directions to your street.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <li className="card p-4">
            <p className="font-semibold">Greater Brisbane</p>
            <p className="mt-1 text-sm text-ink-soft">
              Whole run — we come to you, you don’t come to a shop.
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
              <p className="font-semibold">{region}</p>
              <p className="mt-1 text-sm text-ink-soft">
                Filter the list below, or jump to Maps.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                <a
                  href={mapsSearchUrl(REGION_QUERIES[region])}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fresh-deep underline"
                >
                  Map
                </a>
                <a
                  href={mapsDirectionsUrl(REGION_QUERIES[region])}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fresh-deep underline"
                >
                  Directions
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Suburb list</h2>
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
            blurb: "West End hatch, Carindale SUV, Wynnum ute.",
          },
        ]}
      />
    </div>
  );
}
