"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mapsSearchUrl } from "@/lib/thanks";
import {
  FEATURED_SUBURB_NAMES,
  REGION_LABEL,
  REGION_PILL,
  REGIONS,
  SUBURBS,
  type Region,
  type Suburb,
} from "@/lib/suburbs";

function bookHref(s: Suburb) {
  const q = new URLSearchParams({
    suburb: s.name,
    postcode: s.postcode,
  });
  return `/book?${q.toString()}`;
}

function SuburbRow({ s }: { s: Suburb }) {
  return (
    <li className="area-suburb">
      <div className="area-suburb-id">
        <span className="area-suburb-name">{s.name}</span>
        <span className="area-postcode">{s.postcode}</span>
        <span className="area-suburb-region">{REGION_LABEL[s.region]}</span>
      </div>
      <div className="area-actions">
        <Link href={bookHref(s)} className="area-book">
          Book →
        </Link>
        <a
          href={mapsSearchUrl(`${s.name} QLD ${s.postcode}`)}
          target="_blank"
          rel="noreferrer"
          className="area-map"
          aria-label={`Map of ${s.name}`}
        >
          Map ↗
        </a>
      </div>
    </li>
  );
}

export function SuburbExplorer() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "All">("All");
  const [open, setOpen] = useState(false);

  const counts = useMemo(() => {
    const tally = Object.fromEntries(REGIONS.map((r) => [r, 0])) as Record<
      Region,
      number
    >;
    for (const s of SUBURBS) tally[s.region] += 1;
    return tally;
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SUBURBS.filter((s) => {
      if (region !== "All" && s.region !== region) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) || s.postcode.includes(needle)
      );
    });
  }, [q, region]);

  const searching = q.trim().length > 0 || region !== "All";
  const featured = useMemo(
    () =>
      FEATURED_SUBURB_NAMES.map((name) =>
        SUBURBS.find((s) => s.name === name),
      ).filter((s): s is Suburb => Boolean(s)),
    [],
  );
  const shown = searching || open ? filtered : featured;
  const hidden = searching ? 0 : Math.max(0, filtered.length - featured.length);

  return (
    <div className="area-finder">
      <div className="area-search">
        <label className="label" htmlFor="suburb-search">
          Search suburbs
        </label>
        <input
          id="suburb-search"
          className="field"
          placeholder="e.g. West End or 4101…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q ? (
          <button
            type="button"
            className="area-clear"
            aria-label="Clear search"
            onClick={() => setQ("")}
          >
            ×
          </button>
        ) : null}
      </div>

      <div className="area-pills" role="group" aria-label="Filter by region">
        <button
          type="button"
          aria-pressed={region === "All"}
          className={`area-pill${region === "All" ? " is-on" : ""}`}
          onClick={() => setRegion("All")}
        >
          All ({SUBURBS.length})
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={region === r}
            className={`area-pill${region === r ? " is-on" : ""}`}
            onClick={() => setRegion(r)}
          >
            {REGION_PILL[r]} ({counts[r]})
          </button>
        ))}
      </div>

      <p className="area-count">
        {searching || open
          ? `${filtered.length} suburb${filtered.length === 1 ? "" : "s"}`
          : `Showing ${featured.length} popular suburbs · ${SUBURBS.length} covered`}
      </p>

      {filtered.length === 0 ? (
        <div className="area-miss">
          <p className="area-miss-title">Not on the list</p>
          <p>
            We sometimes stretch the run if a few jobs are already out that
            way. Ask, and say if it is more than one car.
          </p>
          <Link href="/contact" className="area-book">
            Ask about the trip →
          </Link>
        </div>
      ) : (
        <ul className="area-suburbs">
          {shown.map((s) => (
            <SuburbRow key={`${s.name}-${s.postcode}`} s={s} />
          ))}
        </ul>
      )}

      {!searching && hidden > 0 && !open && (
        <button type="button" className="see-more" onClick={() => setOpen(true)}>
          See more · {hidden} suburbs
        </button>
      )}
      {!searching && open && (
        <button type="button" className="see-more" onClick={() => setOpen(false)}>
          Show the nine
        </button>
      )}
    </div>
  );
}
