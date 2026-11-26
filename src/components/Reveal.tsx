"use client";

import { createElement, useCallback, type HTMLAttributes, type ReactNode } from "react";

/**
 * Scroll-driven reveal. One shared scroll listener checks positions directly,
 * so reveals never get skipped on heavy GPU frames (observers can miss beats).
 */
const watched = new Set<HTMLElement>();
let bound = false;
let raf = 0;

function check() {
  raf = 0;
  const limit = window.innerHeight * 0.9;
  for (const el of watched) {
    if (el.getBoundingClientRect().top < limit) {
      el.classList.add("is-in");
      watched.delete(el);
    }
  }
}
function schedule() {
  if (!raf) raf = requestAnimationFrame(check);
}
function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "li" | "article" | "section";
  delay?: number;
  children: ReactNode;
};

export function Reveal({ as = "div", delay = 0, className = "", style, children, ...rest }: Props) {
  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    bind();
    watched.add(el);
    schedule();
    return () => {
      watched.delete(el);
    };
  }, []);
  return createElement(
    as,
    {
      ref,
      className: `reveal ${className}`.trim(),
      style: { ...style, "--d": `${delay}ms` },
      ...rest,
    },
    children,
  );
}
