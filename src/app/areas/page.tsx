import Link from "next/link";
import { PageMast } from "@/components/PageMast";
import { SuburbExplorer } from "@/components/SuburbExplorer";
import { REGION_LABEL, REGIONS } from "@/lib/suburbs";
import { mapsSearchUrl } from "@/lib/thanks";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Service areas",
  description:
    "Squeaky Solutions covers Greater Brisbane — inner, northside, southside, east and west. Check your suburb and open Maps to see the area.",
  path: "/areas",
});

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
        kicker="Greater Brisbane · mobile"
        photo="/media/masts/areas.jpg"
        photoPos="center 55%"
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
      <div className="page-ink-band">
        <div className="section-pad areas-body mx-auto max-w-6xl !pt-10">
          <p className="area-reassure">
            <span>
              Greater Brisbane — we come to you. No shop, no drop-off.
            </span>
            <span className="area-badge">Hose tap on site · no power point</span>
          </p>

          <section>
            <h2 className="font-display text-2xl font-semibold">Check your area</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-soft">
              Five sides of the city. Book a suburb, or open the map.
            </p>
            <ul className="area-regions">
              {REGIONS.map((region) => (
                <li key={region} className="area-region">
                  <div>
                    <h3 className="font-display text-xl font-semibold">
                      {REGION_LABEL[region]}
                    </h3>
                    <p>{REGION_BLURBS[region]}</p>
                  </div>
                  <div className="area-actions">
                    <Link href="/book" className="area-book">
                      Book →
                    </Link>
                    <a
                      href={mapsSearchUrl(REGION_QUERIES[region])}
                      target="_blank"
                      rel="noreferrer"
                      className="area-map"
                      aria-label={`Map of ${REGION_LABEL[region]}`}
                    >
                      Map ↗
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

          <nav className="areas-next" aria-label="Related pages">
            <h2 className="font-display text-2xl font-semibold">Keep going</h2>
            <ul>
              <li>
                <Link href="/book">
                  <span>
                    <strong>Book your suburb</strong>
                    <span>Pick a morning or afternoon window.</span>
                  </span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
              <li>
                <Link href="/jobs">
                  <span>
                    <strong>Typical jobs</strong>
                    <span>West End small, Carindale medium, Wynnum large.</span>
                  </span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
