"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { REEL_SLIDES } from "@/lib/photos";

const INTERVAL_MS = 5200;

export function PhotoReel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = REEL_SLIDES[index];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || paused) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % REEL_SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const go = (next: number) => {
    const length = REEL_SLIDES.length;
    setIndex(((next % length) + length) % length);
  };

  return (
    <section
      className="photo-reel"
      aria-roledescription="carousel"
      aria-label="Job photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="photo-reel-stage">
        {REEL_SLIDES.map((item, i) => (
          <div
            key={item.src}
            className={i === index ? "photo-reel-slide is-on" : "photo-reel-slide"}
            aria-hidden={i !== index}
          >
            <Image
              src={item.src}
              alt={i === index ? item.alt : ""}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: item.pos }}
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {slide.alt}
      </p>
      <div className="photo-reel-bar">
        <button type="button" className="photo-reel-btn" onClick={() => go(index - 1)}>
          Previous
        </button>
        <div className="photo-reel-dots" role="tablist" aria-label="Slides">
          {REEL_SLIDES.map((item, i) => (
            <button
              key={item.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${item.alt}`}
              className={i === index ? "is-on" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="photo-reel-btn" onClick={() => go(index + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}
