import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { FAQ_SECTIONS } from "@/lib/faq";
import { faqJsonLd } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "FAQ",
  description:
    "Squeaky Solutions FAQ: packages and prices, booking and cancel rules, driveway setup, rain, pay on the day, insurance. Brisbane mobile detailing.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <PageMast
        title="Questions before you book"
        crumbs={[{ href: "/faq", label: "FAQ" }]}
      >
        <p>
          Packages, booking, the driveway, pay, and whether we’re insured. If
          it’s not here, use contact — we aim to reply the same day.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-3xl !pt-10">
        <FaqList sections={FAQ_SECTIONS} />
        <RelatedLinks
          links={[
            {
              href: "/book",
              label: "Open the calendar",
              blurb: "Morning or afternoon, including Sunday.",
            },
            {
              href: "/refunds",
              label: "Cancel rules",
              blurb: "Free until 6pm the day before.",
            },
            {
              href: "/areas",
              label: "Check your suburb",
              blurb: "Greater Brisbane list plus maps links.",
            },
            {
              href: "/contact",
              label: "Ask something else",
              blurb: "Out of area, fleet, or a weird car.",
            },
          ]}
        />
      </div>
    </>
  );
}
