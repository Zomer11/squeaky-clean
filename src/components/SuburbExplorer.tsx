"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { mapsDirectionsUrl, mapsSearchUrl } from "@/lib/thanks";
import { REGIONS, SUBURBS, type Region } from "@/lib/suburbs";

export function SuburbExplorer() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "All">("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return SUBURBS.filter((s) => {
      if (region !== "All" && s.region !== region) return false;
      if (!needle) return true;
      return (
        s.name.toLowerCase().includes(needle) ||
        s.postcode.includes(needle)
      );
    });
  }, [q, region]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
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
        </div>
        <div className="sm:max-w-xs sm:flex-1">
          <label className="label" htmlFor="suburb-region">
            Region
          </label>
          <select
            id="suburb-region"
            className="field"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region | "All")}
          >
          <option value="All">All regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
          </select>
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-soft">
        {filtered.length} suburb{filtered.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <li
            key={`${s.name}-${s.postcode}`}
            className="rounded-xl border border-line bg-paper px-3 py-2.5"
          >
            <span className="font-semibold text-ink">{s.name}</span>
            <span className="mt-0.5 block text-xs text-ink-soft">
              {s.region} · {s.postcode}
            </span>
            <span className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
              <Link
                href={`/book?suburb=${encodeURIComponent(s.name)}`}
                className="text-fresh-deep underline"
              >
                Book
              </Link>
              <a
                href={mapsSearchUrl(`${s.name} QLD ${s.postcode}`)}
                target="_blank"
                rel="noreferrer"
                className="text-fresh-deep underline"
              >
                Map
              </a>
              <a
                href={mapsDirectionsUrl(`${s.name} QLD ${s.postcode}`)}
                target="_blank"
                rel="noreferrer"
                className="text-fresh-deep underline"
              >
                Directions
              </a>
            </span>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="mt-6 rounded-xl bg-cream-deep p-4 text-sm">
          Not listed?{" "}
          <a href="/contact" className="font-semibold text-fresh-deep underline">
            Ask us anyway
          </a>{" "}
          — we sometimes stretch the run.
        </p>
      )}
    </div>
  );
}
