"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  THANKS_STORAGE_KEY,
  formatVisitDate,
  type ThanksPayload,
} from "@/lib/thanks";

export function ThanksDetails({ kind }: { kind: "booking" | "inquiry" }) {
  const [payload, setPayload] = useState<ThanksPayload | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(THANKS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ThanksPayload;
      if (parsed.kind === kind) setPayload(parsed);
    } catch {
      /* ignore bad storage */
    }
  }, [kind]);

  const when = payload?.date ? formatVisitDate(payload.date) : null;
  const slotLabel =
    payload?.slot === "am"
      ? "Morning"
      : payload?.slot === "pm"
        ? "Afternoon"
        : null;
  const job = [payload?.package, payload?.vehicle].filter(Boolean).join(" · ");

  if (kind === "inquiry") {
    return (
      <article className="thanks-card card noise">
        <div className="thanks-kicker">
          <p className="chip chip-ok">Inquiry sent</p>
        </div>
        <h1 className="thanks-title">Got it.</h1>
        <p className="thanks-lead">
          We’ll call or email the same day if we can. If it’s urgent, use the
          number on the site.
        </p>
        <div className="thanks-actions">
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
          <Link href="/book" className="btn btn-accent">
            Or just book a slot
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="thanks-card card noise">
      <div className="thanks-kicker">
        <p className="chip chip-ok">
          <span className="thanks-check" aria-hidden>
            ✓
          </span>
          Booked
        </p>
        {payload?.id ? (
          <p className="thanks-ref">#{payload.id}</p>
        ) : null}
      </div>
      <h1 className="thanks-title">You’re booked.</h1>
      {when ? (
        <div className="thanks-when">
          <p className="thanks-when-date">{when}</p>
          {slotLabel ? <p className="thanks-when-slot">{slotLabel}</p> : null}
        </div>
      ) : null}
      <p className="thanks-lead">
        We’ll come to the driveway. Leave the car there, keys sorted. Pay when
        we finish.
      </p>
      {payload && (job || payload.suburb || payload.price) ? (
        <dl className="thanks-facts">
          {job ? (
            <div className="thanks-fact">
              <dt>Job</dt>
              <dd>{job}</dd>
            </div>
          ) : null}
          {payload.suburb ? (
            <div className="thanks-fact">
              <dt>Suburb</dt>
              <dd>{payload.suburb}</dd>
            </div>
          ) : null}
          {payload.price ? (
            <div className="thanks-fact thanks-fact--price">
              <dt>Estimate</dt>
              <dd>
                <span className="thanks-price">${payload.price}</span>
                <span className="thanks-price-note">this visit · pay on the day</span>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      <p className="thanks-note">
        Free cancel until 6pm the day before —{" "}
        <Link href="/refunds" className="font-semibold text-fresh-deep underline">
          refunds
        </Link>
        .
      </p>
      <div className="thanks-actions">
        <Link href="/" className="btn btn-ghost">
          Back home
        </Link>
        <Link href="/book" className="btn btn-primary">
          Book another
        </Link>
      </div>
    </article>
  );
}
