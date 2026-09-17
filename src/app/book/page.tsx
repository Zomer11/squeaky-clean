import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BookingForm } from "@/components/BookingForm";
import { NextAvailableStrip } from "@/components/NextAvailableStrip";
import { getAvailabilityForRange } from "@/lib/booking";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Book a detail",
  description:
    "Book a Squeaky Clean driveway detail in Brisbane. Live morning and afternoon calendar, seven days. Pay on the day.",
  path: "/book",
});

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ suburb?: string }>;
}) {
  const start = new Date().toISOString().slice(0, 10);
  const slots = await getAvailabilityForRange(start, 42);
  const { suburb } = await searchParams;

  return (
    <>
      <NextAvailableStrip />
      <div className="section-pad mx-auto max-w-3xl">
        <Breadcrumbs items={[{ href: "/book", label: "Book" }]} />
        <p className="chip">Live calendar</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
          Book a driveway detail
        </h1>
        <p className="mt-3 text-ink-soft">
          Pick the car, the package, and an open slot. {BUSINESS.payNote}{" "}
          Free cancel until 6pm the day before —{" "}
          <Link href="/refunds" className="font-semibold text-fresh-deep underline">
            refunds
          </Link>
          . Confirmations are instant; we don’t sit on the booking.
        </p>
        <div className="mt-8">
          <BookingForm initialSlots={slots} initialSuburb={suburb} />
        </div>
      </div>
    </>
  );
}
