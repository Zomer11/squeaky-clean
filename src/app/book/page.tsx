import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { NextAvailableStrip } from "@/components/NextAvailableStrip";
import { PageMast } from "@/components/PageMast";
import { getAvailabilityForRange } from "@/lib/booking";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Book a detail",
  description:
    "Book a Squeaky Solutions driveway detail in Brisbane. Live morning and afternoon calendar, seven days. Pay on the day.",
  path: "/book",
});

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ suburb?: string; package?: string }>;
}) {
  const start = new Date().toISOString().slice(0, 10);
  const slots = await getAvailabilityForRange(start, 42);
  const { suburb, package: packageId } = await searchParams;

  return (
    <>
      <NextAvailableStrip />
      <PageMast title="Book a driveway detail" crumbs={[{ href: "/book", label: "Book" }]}>
        <p>
          Pick the job, then a morning or afternoon. {BUSINESS.payNote} Free
          cancel until 6pm the day before —{" "}
          <Link href="/refunds">refunds</Link>.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-4xl !pt-10">
        <BookingForm
          initialSlots={slots}
          initialSuburb={suburb}
          initialPackage={packageId}
        />
      </div>
    </>
  );
}
