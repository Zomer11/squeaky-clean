"use client";

import { useState } from "react";
import { BUSINESS } from "@/lib/constants";

const tel = BUSINESS.phone.replace(/\s/g, "");

export function ContactStrip() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(BUSINESS.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <ul className="contact-tiles">
      <li>
        <a className="contact-tile" href={`tel:${tel}`}>
          <span className="contact-tile-kicker">Call</span>
          <span className="contact-tile-value">{BUSINESS.phone}</span>
        </a>
      </li>
      <li>
        <div className="contact-tile">
          <span className="contact-tile-kicker">Email</span>
          <span className="contact-tile-row">
            <a className="contact-tile-value" href={`mailto:${BUSINESS.email}`}>
              {BUSINESS.email}
            </a>
            <button type="button" className="contact-copy" onClick={copyEmail}>
              {copied ? "Copied" : "Copy"}
            </button>
          </span>
        </div>
      </li>
      <li>
        <div className="contact-tile">
          <span className="contact-tile-kicker">Reply</span>
          <span className="contact-tile-value contact-tile-reply">
            <span className="contact-dot" aria-hidden />
            Same day when we can
          </span>
        </div>
      </li>
    </ul>
  );
}
