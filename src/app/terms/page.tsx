import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Terms",
  description:
    "Booking rules for Squeaky Solutions mobile car detailing in Brisbane — driveway access, pay on the day, and what the package covers.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms" path="/terms">
      <p>
        These terms cover bookings with {BUSINESS.name} — mobile car detailing
        at your Brisbane driveway. Using the site or booking a slot means you
        accept them.
      </p>
      <h2>The booking</h2>
      <p>
        An online booking reserves a morning or afternoon window. Exact arrival
        time moves with the day’s route. {BUSINESS.payNote}
      </p>
      <p>
        The price you see at booking is the estimate we work to. We’ll confirm
        before we start if the car or the job looks different.
      </p>
      <h2>Your driveway</h2>
      <p>
        Have the car on the drive, a working hose tap, and enough room to work.
        Dogs inside or held. If we can’t safely reach the car (blocked drive,
        aggressive dog, locked gate with no code), we’ll reschedule.
      </p>
      <h2>Cancellations and refunds</h2>
      <p>
        Free cancel until 6pm the day before. Pay-on-the-day, so we usually
        have nothing to refund. Full detail:{" "}
        <Link href="/refunds">refunds &amp; cancellations</Link>.
      </p>
      <h2>The work</h2>
      <p>
        We wash and tidy to the package you booked. We don’t promise ceramic
        coating, paint correction, or a show-car finish unless we’ve agreed
        that in writing. Existing chips, swirls, and stains may still show.
      </p>
      <h2>Your data</h2>
      <p>
        How we handle names, phones, and addresses is in the{" "}
        <Link href="/privacy">privacy policy</Link>. Cookies:{" "}
        <Link href="/cookies">cookies</Link>.
      </p>
      <p>
        Questions: {BUSINESS.phone} or {BUSINESS.email}.
      </p>
    </LegalPage>
  );
}
