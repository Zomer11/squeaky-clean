"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const botCheckEnabled = Boolean(SITE_KEY);

/**
 * Honeypot field plus Cloudflare Turnstile (when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set).
 * `onToken` must be stable (a setState function works).
 */
export function BotGuard({
  honeypot,
  onHoneypot,
  onToken,
}: {
  honeypot: string;
  onHoneypot: (value: string) => void;
  onToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let widgetId: string | undefined;
    let cancelled = false;

    const mount = () => {
      if (cancelled || !ref.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: "auto",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    if (window.turnstile) {
      mount();
    } else {
      let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.dataset.turnstile = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", mount);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  return (
    <>
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
      >
        <label htmlFor="bg-website">Leave this empty</label>
        <input
          id="bg-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => onHoneypot(e.target.value)}
        />
      </div>
      {SITE_KEY && <div ref={ref} className="min-h-[65px]" />}
    </>
  );
}
