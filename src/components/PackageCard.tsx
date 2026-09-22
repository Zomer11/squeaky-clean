"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MAINTENANCE_PRICES,
  PACKAGES,
  PRICING,
  SIZES,
  estimatePrice,
  isMaintenance,
  type PackageId,
} from "@/lib/constants";

/** Combined packages only — each image used once site-wide. */
const PACKAGE_COVER: Partial<Record<PackageId, string>> = {
  good: "/media/foam-wash.jpg",
  better: "/media/foam-corvette.jpg",
  best: "/media/foam-pexels.jpg",
};

type Props = {
  packageId: PackageId;
};

export function PackageCard({ packageId }: Props) {
  const pkg = PACKAGES.find((p) => p.id === packageId);
  const [open, setOpen] = useState(false);
  if (!pkg) return null;

  const from = estimatePrice(pkg.id, "small", "one-off");
  const cover = PACKAGE_COVER[pkg.id];

  return (
    <article id={pkg.id} className="pkg-card card flex flex-col overflow-hidden">
      {cover ? (
        <div className="relative aspect-[16/10] w-full bg-ink">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-soft">
            {pkg.grade} · {pkg.time}
          </p>
          <h2 className="font-display mt-1 text-3xl font-semibold">{pkg.label}</h2>
        </div>
        <p className="text-right">
          <span className="block text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
            From
          </span>
          <span className="font-display text-4xl font-semibold">${from}</span>
        </p>
      </div>
      <p className="px-5 pt-3 text-sm text-ink-soft">{pkg.blurb}</p>
      <p className="px-5 pt-2 text-xs font-semibold text-fresh-deep">{pkg.who}</p>

      {isMaintenance(pkg.id) ? (
        <div className="mt-4 px-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th className="pb-2 font-bold">Size</th>
                <th className="pb-2 font-bold">Weekly</th>
                <th className="pb-2 font-bold">Fortnightly</th>
                <th className="pb-2 font-bold">Monthly</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((v) => (
                <tr key={v.id} className="border-t border-line/70">
                  <td className="py-1.5">{v.label}</td>
                  <td className="py-1.5 font-semibold">
                    ${MAINTENANCE_PRICES.weekly[v.id]}
                  </td>
                  <td className="py-1.5 font-semibold">
                    ${MAINTENANCE_PRICES.fortnightly[v.id]}
                  </td>
                  <td className="py-1.5 font-semibold">
                    ${MAINTENANCE_PRICES.monthly[v.id]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="mt-4 space-y-1.5 px-5 text-sm text-ink">
          {SIZES.map((v) => (
            <li
              key={v.id}
              className="flex justify-between gap-3 border-b border-line/70 py-1.5 last:border-0"
            >
              <span>{v.label}</span>
              <span className="font-semibold">
                ${estimatePrice(pkg.id, v.id, "one-off")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="px-5 pt-3">
        <button
          type="button"
          className="pkg-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide what’s in it" : "What’s included"}
          <span aria-hidden>{open ? "–" : "+"}</span>
        </button>
        <div className={`pkg-panel ${open ? "is-open" : ""}`}>
          <div className="pkg-panel-inner">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
              In the price
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink">
              {pkg.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
              Not in this package
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-soft">
              {pkg.notIncluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-auto p-5 pt-4">
        <Link href={`/book?package=${pkg.id}`} className="btn btn-primary w-full">
          Book {pkg.label.toLowerCase()}
        </Link>
        <p className="mt-2 text-center text-[0.7rem] text-ink-soft">
          {PRICING.gstNote} Pay on the day.
        </p>
      </div>
    </article>
  );
}
