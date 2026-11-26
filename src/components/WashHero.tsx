"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WashEngine } from "@/lib/wash/engine";
import { WashSound } from "@/lib/wash/sound";

type Chapter = { a: number; b: number };

const PAINTS = [
  { name: "Obsidian", hex: "#14171c" },
  { name: "Pearl", hex: "#d9dbdc" },
  { name: "Ember", hex: "#c2410c" },
  { name: "Sapphire", hex: "#0f2f63" },
];

const BEATS = [
  { label: "Foam", at: 0.18 },
  { label: "Rinse", at: 0.4 },
  { label: "Protect", at: 0.62 },
  { label: "Done", at: 0.9 },
];

const CALLOUTS = [
  { title: "Ceramic spray sealant", body: "Paint · The Full Detail" },
  { title: "Wheels + iron decon", body: "Brake dust, gone" },
  { title: "Glass, inside and out", body: "Every package" },
  { title: "Tyre shine", body: "Satin, not greasy" },
];

function opacityFor(p: number, c: Chapter, fade = 0.035) {
  const inA = c.a <= 0 ? 1 : Math.min(1, Math.max(0, (p - (c.a - fade)) / fade));
  const outB = c.b >= 1 ? 1 : Math.min(1, Math.max(0, ((c.b + fade) - p) / fade));
  return Math.min(inA, outB);
}

export function WashHero({ fromPrice }: { fromPrice: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WashEngine | null>(null);
  const soundRef = useRef<WashSound | null>(null);
  const soundOnRef = useRef<boolean | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const calloutWrapRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");
  const [sound, setSound] = useState(false);
  const [wire, setWire] = useState(false);
  const [paint, setPaint] = useState(PAINTS[0].name);
  const [holding, setHolding] = useState(false);

  // --- boot the engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") || probe.getContext("webgl");
    if (!gl) {
      void Promise.resolve().then(() => setState("fallback"));
      return;
    }

    soundRef.current = new WashSound();
    import("@/lib/wash/engine").then(({ WashEngine }) => {
      if (disposed) return;
      const engine = new WashEngine(canvas, {
        modelUrl: "/models/car.glb",
        mobile,
        reducedMotion: reduced,
        onReady: () => !disposed && setState("ready"),
        onError: () => !disposed && setState("fallback"),
        onSpray: (level, foam) => {
          if (soundOnRef.current) soundRef.current?.set(level, foam);
          const ring = ringRef.current;
          if (ring) ring.style.strokeDashoffset = String(119.4 * (1 - engine.washAmount));
        },
      });
      engine.setCallouts(
        calloutWrapRef.current,
        Array.from(section.querySelectorAll<HTMLElement>(".callout")),
      );
      engineRef.current = engine;
      void engine.load();
    });

    const io = new IntersectionObserver(
      ([e]) => engineRef.current?.setActive(e.isIntersecting),
      { rootMargin: "100px" },
    );
    io.observe(section);

    return () => {
      disposed = true;
      io.disconnect();
      engineRef.current?.dispose();
      engineRef.current = null;
      soundRef.current?.dispose();
    };
  }, []);

  // --- scroll → progress, chapters, rail
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    const chapters = Array.from(section.querySelectorAll<HTMLElement>(".wash-chapter"));
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
      engineRef.current?.setProgress(p);
      for (const el of chapters) {
        const o = opacityFor(p, { a: Number(el.dataset.a), b: Number(el.dataset.b) });
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - o) * 18}px, 0)`;
        el.style.visibility = o < 0.02 ? "hidden" : "visible";
      }
      if (railRef.current) railRef.current.style.setProperty("--p", String(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // --- cursor rotates the studio
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      engineRef.current?.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const startHold = () => {
    setHolding(true);
    engineRef.current?.setHolding(true);
    // the same tap that starts the wash unlocks audio (browsers gate it)
    if (soundOnRef.current === null) {
      soundOnRef.current = true;
      setSound(true);
    }
    if (soundOnRef.current) soundRef.current?.start();
  };
  const endHold = () => {
    setHolding(false);
    engineRef.current?.setHolding(false);
  };
  const toggleSound = () => {
    const next = !sound;
    soundOnRef.current = next;
    setSound(next);
    if (next) soundRef.current?.start();
    else soundRef.current?.stop();
  };
  const toggleWire = () => {
    const next = !wire;
    setWire(next);
    engineRef.current?.setBlueprint(next);
  };
  const pickPaint = (p: (typeof PAINTS)[number]) => {
    setPaint(p.name);
    engineRef.current?.setPaint(p.hex);
  };

  return (
    <section
      ref={sectionRef}
      className="wash-hero"
      aria-label="Auto Care Detailing — a car washed live as you scroll"
    >
      <div className="wash-stage">
        <canvas
          ref={canvasRef}
          className={`wash-canvas ${state === "ready" ? "is-ready" : ""}`}
          aria-hidden
        />
        <div
          className={`wash-poster ${state === "ready" ? "is-hidden" : ""}`}
          aria-hidden
        />
        {state === "loading" && (
          <div className="wash-loader" aria-hidden>
            <span />
            Warming up the pressure washer
          </div>
        )}
        <div className="wash-vignette" aria-hidden />
        <div className="film-grain" aria-hidden />

        {/* 00 — hero */}
        <div data-a="0" data-b="0.075" className="wash-chapter wash-chapter--hero">
          <p className="eyebrow">Brisbane · Mobile car detailing</p>
          <h1 className="wash-title">
            <span>Showroom finish.</span>
            <span className="accent">In your driveway.</span>
          </h1>
          <p className="wash-lede">
            We bring the water, the foam and the kit. You keep your weekend.
            Sundays included, pay on the day.
          </p>
          <div className="wash-actions">
            <Link href="/book" className="btn btn-accent btn-lg">
              Book a detail
            </Link>
            <button
              type="button"
              className={`hold-btn ${holding ? "is-holding" : ""}`}
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && startHold()}
              onKeyUp={endHold}
              onContextMenu={(e) => e.preventDefault()}
              disabled={state === "fallback"}
            >
              <svg viewBox="0 0 44 44" aria-hidden>
                <circle cx="22" cy="22" r="19" className="track" />
                <circle ref={ringRef} cx="22" cy="22" r="19" className="fill" />
              </svg>
              <span>Hold to wash</span>
            </button>
          </div>
          <p className="wash-scroll-cue" aria-hidden>
            <span /> or scroll to wash it
          </p>
        </div>

        {/* 01 — foam */}
        <div data-a="0.12" data-b="0.27" className="wash-chapter wash-chapter--side">
          <p className="beat-num">01 / Snow foam</p>
          <h2 className="beat-title">Foam first. Always.</h2>
          <p className="beat-body">
            Thick foam softens and lifts the grit before a mitt ever touches the
            paint. That&rsquo;s how you skip the swirl marks.
          </p>
        </div>

        {/* 02 — rinse */}
        <div data-a="0.31" data-b="0.49" className="wash-chapter wash-chapter--side">
          <p className="beat-num">02 / Pressure rinse</p>
          <h2 className="beat-title">Front to back. Top to bottom.</h2>
          <p className="beat-body">
            The dirt leaves with the water, not under a cloth. Wheels get their
            own brush and their own bucket.
          </p>
        </div>

        {/* 03 — protect */}
        <div data-a="0.55" data-b="0.67" className="wash-chapter wash-chapter--side">
          <p className="beat-num">03 / Protect</p>
          <h2 className="beat-title">Gloss you can see your face in.</h2>
          <p className="beat-body">
            Ceramic spray sealant on the paint. Water beads, dust slides, and the
            shine lasts weeks instead of days.
          </p>
        </div>

        {/* callouts pinned to the car */}
        <div ref={calloutWrapRef} className="wash-callouts" aria-hidden>
          {CALLOUTS.map((c, i) => (
            <div
              key={c.title}
              className={`callout callout--${i}`}
            >
              <span className="callout-dot" />
              <span className="callout-line" />
              <span className="callout-card">
                <strong>{c.title}</strong>
                <em>{c.body}</em>
              </span>
            </div>
          ))}
        </div>

        {/* 04 — outro */}
        <div data-a="0.86" data-b="1" className="wash-chapter wash-chapter--outro">
          <p className="beat-num">That&rsquo;s the whole visit</p>
          <h2 className="beat-title beat-title--big">
            Your car. Our kit.
            <br />
            Your driveway.
          </h2>
          <div className="paint-picker" role="radiogroup" aria-label="Try a paint colour">
            <span className="paint-label">Try a colour</span>
            {PAINTS.map((p) => (
              <button
                key={p.name}
                type="button"
                role="radio"
                aria-checked={paint === p.name}
                className="paint-swatch"
                style={{ "--swatch": p.hex } as React.CSSProperties}
                onClick={() => pickPaint(p)}
                title={p.name}
              >
                <span className="sr-only">{p.name}</span>
              </button>
            ))}
          </div>
          <div className="wash-actions">
            <Link href="/book" className="btn btn-accent btn-lg">
              Book from ${fromPrice}
            </Link>
            <Link href="#packages" className="btn btn-ghost btn-lg">
              Compare packages
            </Link>
          </div>
        </div>

        {/* progress rail */}
        <div ref={railRef} className="wash-rail" aria-hidden>
          <div className="wash-rail-track">
            <div className="wash-rail-fill" />
          </div>
          {BEATS.map((b) => (
            <span key={b.label} style={{ top: `${b.at * 100}%` }}>
              {b.label}
            </span>
          ))}
        </div>

        {/* studio controls */}
        <div className="wash-tools">
          <button type="button" onClick={toggleSound} aria-pressed={sound} className="tool-chip">
            <span className={`eq ${sound ? "is-on" : ""}`} aria-hidden>
              <i />
              <i />
              <i />
            </span>
            Sound {sound ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={toggleWire}
            aria-pressed={wire}
            className="tool-chip"
            disabled={state !== "ready"}
          >
            {wire ? "Paint" : "Wireframe"}
          </button>
        </div>
      </div>
    </section>
  );
}
