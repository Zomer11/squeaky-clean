"use client";

import Link from "next/link";
import { useState } from "react";
import { COMBINED_PACKAGES, SIZES, type SizeId } from "@/lib/constants";

export function PackagePicker() {
  const [size, setSize] = useState<SizeId>("small");

  return (
    <div className="tier">
      <div className="tier-sizes" role="radiogroup" aria-label="Car size">
        {SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={size === s.id}
            className="tier-size"
            onClick={() => setSize(s.id)}
          >
            <strong>{s.label}</strong>
            <span>{s.blurb.replace(/\.$/, "")}</span>
          </button>
        ))}
      </div>

      <ul className="tier-grid">
        {COMBINED_PACKAGES.map((p, i) => (
          <li key={p.id} className={`tier-card ${i === 1 ? "is-featured" : ""}`}>
            {i === 1 && <span className="tier-flag">Most booked</span>}
            <p className="tier-grade">
              <span>{String(i + 1).padStart(2, "0")}</span> {p.grade}
            </p>
            <h3 className="tier-name">{p.label}</h3>
            <p className="tier-price">
              <span className="cur">$</span>
              <span key={size} className="num">
                {p.prices[size]}
              </span>
              <span className="tier-time">{p.time}</span>
            </p>
            <p className="tier-blurb">{p.blurb}</p>
            <ul className="tier-list">
              {p.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link
              href={`/book?package=${p.id}`}
              className={`btn ${i === 1 ? "btn-accent" : "btn-ghost"} w-full`}
            >
              Book {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
