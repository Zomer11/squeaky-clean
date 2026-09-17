import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DetailCar3D } from "@/components/DetailCar3D";
import { RelatedLinks } from "@/components/RelatedLinks";
import {
  PACKAGES,
  PRICING,
  VEHICLES,
  estimatePrice,
} from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Services & pricing",
  description:
    "Brisbane mobile car detailing prices: exterior, interior, and full detail for hatch, sedan, SUV and ute. GST included. Book AM or PM online.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="section-pad mx-auto max-w-6xl">
      <Breadcrumbs items={[{ href: "/services", label: "Services" }]} />
      <p className="chip">Mobile car detailing</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Services & pricing
      </h1>
      <p className="mt-4 max-w-2xl text-ink-soft">
        Hatch one-off from ${estimatePrice("exterior", "hatch", "one-off")}.{" "}
        {PRICING.gstNote} Fortnightly and monthly plans take a bit off.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PACKAGES.map((p) => (
          <article key={p.id} className="card flex flex-col p-5">
            <h2 className="font-display text-2xl font-semibold">{p.label}</h2>
            <p className="mt-2 text-sm text-ink-soft">{p.blurb}</p>
            <p className="mt-6">
              <span className="font-display text-4xl font-semibold">
                ${estimatePrice(p.id, "hatch", "one-off")}
              </span>
              <span className="text-sm text-ink-soft"> hatch · one-off</span>
            </p>
            <ul className="mt-4 flex-1 space-y-1 text-sm text-ink-soft">
              {VEHICLES.map((v) => (
                <li key={v.id}>
                  {v.label}: ${estimatePrice(p.id, v.id, "one-off")}
                </li>
              ))}
            </ul>
            <Link href="/book" className="btn btn-primary mt-6 w-full">
              Book {p.label.toLowerCase()}
            </Link>
          </article>
        ))}
      </div>

      <h2 className="font-display mt-14 text-3xl font-semibold">What we wash</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VEHICLES.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-line bg-paper p-5"
          >
            <div className="flex justify-center py-2" aria-hidden>
              <DetailCar3D vehicle={v.id} size="md" />
            </div>
            <h3 className="mt-2 font-semibold">{v.label}</h3>
            <p className="mt-1 text-sm text-ink-soft">{v.blurb}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-sm text-ink-soft">
        Fleet, boats, or something weirder —{" "}
        <Link href="/contact" className="font-semibold text-fresh-deep underline">
          ask
        </Link>
        . Ceramic and paint correction aren’t on this card yet. Same-day
        inquiries: we aim to reply before close.
      </p>
      <RelatedLinks
        links={[
          {
            href: "/faq",
            label: "FAQ",
            blurb: "How long it takes, Sundays, dogs, cancel rules.",
          },
          {
            href: "/jobs",
            label: "Typical jobs",
            blurb: "What a driveway visit usually looks like.",
          },
          {
            href: "/areas",
            label: "Service areas",
            blurb: "Check the suburb list and open maps.",
          },
        ]}
      />
    </div>
  );
}
