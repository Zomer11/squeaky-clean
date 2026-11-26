import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { BUSINESS, DONATION } from "@/lib/constants";
import { hasGoogleMapsLink, hasGoogleReviewLink } from "@/lib/reviews";
import { isPublishedAbn } from "@/lib/site";

const EXPLORE = [
  { href: "/services", label: "Services & pricing" },
  { href: "/book", label: "Book online" },
  { href: "/areas", label: "Service areas" },
  { href: "/jobs", label: "Typical jobs" },
  { href: "/donation", label: "Donations" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terms", label: "Terms" },
  { href: "/refunds", label: "Refunds" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-cta">
          <p className="footer-big">
            Dirty car?
            <br />
            <span className="dim">Clean driveway soon.</span>
          </p>
          <Link href="/book" className="btn btn-accent btn-lg">
            Book a detail
          </Link>
        </div>

        <div className="footer-grid">
          <div>
            <Wordmark />
            <p className="footer-note">{BUSINESS.tagline}</p>
            <p className="footer-note">{BUSINESS.hours}</p>
            <p className="footer-give">
              <b>{DONATION.percent}%</b> of every job goes to Palestine, Sudan &amp; Lebanon.
            </p>
          </div>
          <div>
            <p className="footer-h">Contact</p>
            <ul className="footer-list">
              <li>
                <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>
              </li>
              <li>
                <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              </li>
              {hasGoogleMapsLink() ? (
                <li>
                  <a href={BUSINESS.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    Google Business
                  </a>
                </li>
              ) : null}
              {hasGoogleReviewLink() ? (
                <li>
                  <a href={BUSINESS.googleReviewUrl} target="_blank" rel="noopener noreferrer">
                    Leave a Google review
                  </a>
                </li>
              ) : null}
              {isPublishedAbn(BUSINESS.abn) ? <li className="dim">ABN {BUSINESS.abn}</li> : null}
            </ul>
          </div>
          <div>
            <p className="footer-h">Explore</p>
            <ul className="footer-list footer-list--cols">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <p>
            © {year} {BUSINESS.name} · Brisbane mobile car detailing
          </p>
          <p className="footer-credit">
            3D car based on{" "}
            <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept" target="_blank" rel="noopener noreferrer">
              Car Concept
            </a>{" "}
            by Eric Chadwick / Darmstadt Graphics Group,{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
              CC BY 4.0
            </a>
            , modified.
          </p>
          <ul>
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
