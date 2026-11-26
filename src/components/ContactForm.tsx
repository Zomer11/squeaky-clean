"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BotGuard, botCheckEnabled } from "@/components/BotGuard";
import { FormConsent } from "@/components/FormConsent";
import { THANKS_STORAGE_KEY } from "@/lib/thanks";

const TOPICS = [
  { id: "fleet", label: "Fleet / Multi-Car", fill: "Fleet / multi-car: " },
  { id: "area", label: "Out-of-Area Quote", fill: "Out-of-area quote: " },
  { id: "stain", label: "Stain / Scratch Photo", fill: "Stain or scratch (I can send a photo): " },
  { id: "gift", label: "Gift Voucher", fill: "Question about a gift voucher: " },
  { id: "general", label: "General Question", fill: "" },
] as const;

export function ContactForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [suburb, setSuburb] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Tick the box to agree to the privacy policy and terms.");
      document.getElementById("contact-consent")?.focus();
      return;
    }
    const picked = TOPICS.find((item) => item.id === topic);
    let body = message.trim();
    if (picked?.fill && !body.startsWith(picked.fill)) {
      body = `${picked.fill}${body}`.trim();
    }
    if (body.length < 5) {
      setError("Add a short message so we know what you need.");
      return;
    }
    if (botCheckEnabled && !turnstileToken) {
      setError("Give the human check a second to finish, then send again.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          suburb,
          message: body,
          consent: true,
          website,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn’t send.");
        return;
      }
      try {
        sessionStorage.setItem(
          THANKS_STORAGE_KEY,
          JSON.stringify({ kind: "inquiry" }),
        );
      } catch {
        /* private mode */
      }
      router.push("/thanks?kind=inquiry");
      return;
    } catch {
      setError("Network hiccup — try again or call us.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5 md:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-name">
            Name
          </label>
          <input
            id="c-name"
            name="name"
            className="field"
            autoComplete="name"
            placeholder="Alex Taylor"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-phone">
            Phone
          </label>
          <input
            id="c-phone"
            name="phone"
            className="field"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0400 000 000"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="c-email">
            Email (optional)
          </label>
          <input
            id="c-email"
            name="email"
            className="field"
            type="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="alex@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-suburb">
            Suburb (optional)
          </label>
          <input
            id="c-suburb"
            name="suburb"
            className="field"
            autoComplete="address-level2"
            placeholder="e.g. Indooroopilly, Paddington"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
          />
        </div>
      </div>
      <div>
        <div className="contact-pills" role="group" aria-label="What is this about?">
          {TOPICS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={topic === item.id}
              className={`contact-pill${topic === item.id ? " is-on" : ""}`}
              onClick={() => {
                const previous = TOPICS.find((entry) => entry.id === topic);
                setTopic(item.id);
                setMessage((current) => {
                  const trimmed = current.trim();
                  if (!trimmed || (previous && trimmed === previous.fill.trim())) {
                    return item.fill;
                  }
                  return current;
                });
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="label" htmlFor="c-message">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          className="field min-h-32"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. fleet job or out of area…"
        />
      </div>
      <FormConsent
        id="contact-consent"
        checked={agreed}
        onChange={setAgreed}
      />
      <BotGuard honeypot={website} onHoneypot={setWebsite} onToken={setTurnstileToken} />
      {error && (
        <p
          className="text-sm font-medium text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
