"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormConsent } from "@/components/FormConsent";
import { THANKS_STORAGE_KEY } from "@/lib/thanks";

export function ContactForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [suburb, setSuburb] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("Tick the box to agree to the privacy policy and terms.");
      document.getElementById("contact-consent")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, suburb, message }),
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
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
          />
        </div>
      </div>
      <div>
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
