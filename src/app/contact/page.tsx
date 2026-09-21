import { ContactForm } from "@/components/ContactForm";
import { IconMark } from "@/components/IconMark";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact",
  description:
    "Call, email, or send Squeaky Solutions an inquiry. We aim to reply the same day. Bookings confirm instantly on the calendar.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageMast title="Contact" crumbs={[{ href: "/contact", label: "Contact" }]}>
        <p>
          Bookings confirm on the calendar. For everything else we aim to reply
          the same day — seven days, not “business hours only”.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-3xl !pt-10">
        <ul className="grid gap-6 border-y border-line py-6 sm:grid-cols-3 sm:gap-0">
          <li className="sm:pr-6">
            <IconMark name="phone" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Call
            </p>
            <a
              href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}
              className="mt-1 block font-semibold underline"
            >
              {BUSINESS.phone}
            </a>
          </li>
          <li className="sm:border-l sm:border-line sm:px-6">
            <IconMark name="mail" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Email
            </p>
            <a href={`mailto:${BUSINESS.email}`} className="mt-1 block font-semibold underline">
              {BUSINESS.email}
            </a>
          </li>
          <li className="sm:border-l sm:border-line sm:pl-6">
            <IconMark name="clock" />
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Reply
            </p>
            <p className="mt-1 font-semibold">Same day when we can</p>
          </li>
        </ul>

        <div className="mt-8">
          <ContactForm />
        </div>
        <RelatedLinks
          links={[
            {
              href: "/book",
              label: "Skip the form",
              blurb: "If you just want a slot, book it.",
            },
            {
              href: "/faq",
              label: "FAQ",
              blurb: "Cancel window, hose tap, suburbs.",
            },
          ]}
        />
      </div>
    </>
  );
}
