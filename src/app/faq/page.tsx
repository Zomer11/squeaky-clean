import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { FAQS } from "@/lib/faq";
import { faqJsonLd } from "@/lib/schema";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "FAQ",
  description:
    "Do you come to the house, how do you pay, Sundays, cancel rules, suburbs, and how fast Squeaky Solutions replies in Brisbane.",
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
          Mobile detailing at your Brisbane driveway. If it’s not here, use
          contact — we aim to reply the same day.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-3xl !pt-10">
        <FaqList items={FAQS} />
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
