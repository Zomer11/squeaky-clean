"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DONATION } from "@/lib/constants";

const STORAGE_KEY = "sq-giveback-seen-v8";

const FLAGS = [
  { src: "/media/flags/palestine.svg", alt: "Flag of Palestine" },
  { src: "/media/flags/sudan.svg", alt: "Flag of Sudan" },
  { src: "/media/flags/lebanon.svg", alt: "Flag of Lebanon" },
] as const;

function CauseFlags() {
  return (
    <div className="giveback-pop-flags">
      {FLAGS.map((flag) => (
        <img
          key={flag.src}
          src={flag.src}
          alt={flag.alt}
          className="giveback-pop-flag"
        />
      ))}
    </div>
  );
}

export function GiveBackPopup() {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode — still show once this mount */
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const showTimer = window.setTimeout(
      () => {
        setOpen(true);
        window.setTimeout(() => setEntered(true), reduced ? 0 : 30);
      },
      reduced ? 100 : 480,
    );

    return () => window.clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function dismiss() {
    setEntered(false);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.setTimeout(
      () => {
        setOpen(false);
        try {
          sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* ignore */
        }
      },
      reduced ? 0 : 280,
    );
  }

  if (!open) return null;

  return (
    <div
      className={`giveback-pop ${entered ? "is-in" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="giveback-pop-scrim"
        aria-hidden="true"
        onClick={dismiss}
      />
      <div className="giveback-pop-card">
        <button
          type="button"
          className="giveback-pop-x"
          aria-label="Close"
          onClick={dismiss}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
        <h2 id={titleId} className="giveback-pop-heading">
          <span className="giveback-pop-word">{DONATION.percent}%</span>
          <span className="giveback-pop-of">donation</span>
        </h2>
        <p className="giveback-pop-from">from every job</p>
        <p className="giveback-pop-places">Palestine · Sudan · Lebanon</p>
        <CauseFlags />
        <p className="giveback-pop-lead">{DONATION.lead}</p>
        <button
          ref={closeRef}
          type="button"
          className="btn btn-primary giveback-pop-btn"
          onClick={dismiss}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
