"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THANKS_STORAGE_KEY, type ThanksPayload } from "@/lib/thanks";

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

  if (kind === "inquiry") {
    return (
      <p className="mt-3 text-ink-soft">
        We’ll call or email the same day if we can. If it’s urgent, use the
        number on the site.
      </p>
    );
  }

  if (!payload) {
    return (
      <p className="mt-3 text-ink-soft">
        You’re on the run. Leave the car in the driveway with keys sorted.
        Pay on the day.
      </p>
    );
  }

  return (
    <>
      <p className="mt-3 text-ink-soft">
        We’ll roll up
        {payload.date ? ` on ${payload.date}` : ""}
        {payload.slot ? ` ${payload.slot === "am" ? "morning" : "afternoon"}` : ""}
        . Leave the car home. Pay when we finish.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-ink">
        {payload.id ? (
          <li>
            <strong>Booking:</strong> #{payload.id}
          </li>
        ) : null}
        {payload.price ? (
          <li>
            <strong>Estimate:</strong> ${payload.price} for this visit
          </li>
        ) : null}
        {payload.package || payload.vehicle ? (
          <li>
            <strong>Job:</strong>{" "}
            {[payload.package, payload.vehicle].filter(Boolean).join(" · ")}
          </li>
        ) : null}
        {payload.suburb ? (
          <li>
            <strong>Suburb:</strong> {payload.suburb}
          </li>
        ) : null}
      </ul>
      <p className="mt-4 text-sm text-ink-soft">
        Free cancel until 6pm the day before —{" "}
        <Link href="/refunds" className="font-semibold text-fresh-deep underline">
          refunds
        </Link>
        .
      </p>
    </>
  );
}
