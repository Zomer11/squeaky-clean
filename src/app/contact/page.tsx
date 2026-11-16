import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { ContactStrip } from "@/components/ContactStrip";
import { PageMast } from "@/components/PageMast";
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
      <PageMast
        title="Contact"
        crumbs={[{ href: "/contact", label: "Contact" }]}
        scene="contact"
         kicker="Same-day replies"
         photo="/media/masts/contact.jpg"
         photoPos="center 58%"
      >
        <p>
          Bookings confirm on the calendar. For everything else we aim to reply
          the same day — seven days, not “business hours only”.
        </p>
      </PageMast>
      <div className="section-pad contact-shell mx-auto max-w-3xl !pt-10">
        <ContactStrip />

        <div className="mt-8">
          <ContactForm />
        </div>
        <nav className="contact-next" aria-label="Related pages">
          <h2 className="font-display text-2xl font-semibold">Keep going</h2>
          <ul>
            <li>
              <Link href="/book">
                <span>
                  <strong>Skip the form</strong>
                  <span>If you just want a slot, book it.</span>
                </span>
                <span aria-hidden>→</span>
              </Link>
            </li>
            <li>
              <Link href="/faq">
                <span>
                  <strong>FAQ</strong>
                  <span>Most common questions.</span>
                </span>
                <span aria-hidden>→</span>
              </Link>
            </li>
            <li>
              <Link href="/areas">
                <span>
                  <strong>Brisbane service areas</strong>
                  <span>See if we already run your suburb.</span>
                </span>
                <span aria-hidden>→</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
