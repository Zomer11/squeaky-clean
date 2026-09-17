import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Refunds & cancellations",
  description:
    "Cancel a Squeaky Clean booking for free until 6pm the day before. Pay on the day, so there is usually nothing to refund.",
  path: "/refunds",
});

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds & cancellations" path="/refunds">
      <p>
        {BUSINESS.name} is paid on the day — cash or card when we finish. We
        don’t take a deposit or an online payment, so there is usually nothing
        to refund.
      </p>
      <h2>Cancelling a booking</h2>
      <p>
        Cancel for free if you tell us by <strong>6pm the day before</strong>{" "}
        the job (Brisbane time). Call{" "}
        <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>{" "}
        or email{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, or use the{" "}
        <Link href="/contact">contact form</Link>.
      </p>
      <p>
        After 6pm the day before, or if nobody is home / the car isn’t there
        (a no-show), we release the slot. We don’t charge a cancellation fee
        because you haven’t paid yet. We just won’t hold that window.
      </p>
      <h2>When we have to move the job</h2>
      <p>
        Storms, unsafe access, a blocked drive, a locked gate with no code, or
        a dog we can’t work around — we reschedule. That’s not a cancellation
        on you.
      </p>
      <h2>If we started and you stop us</h2>
      <p>
        If we’ve already started washing and you ask us to stop, we may charge
        for the time and product already used. We’ll tell you before we leave.
      </p>
      <h2>If we got it wrong</h2>
      <p>
        If something we did is obviously unfinished or marked, say so before we
        leave or the same day. We’ll come back and fix our work. We don’t
        refund for swirl that was already in the paint, or for weather that
        hits the car after we leave.
      </p>
      <p>
        Booking rules sit in the <Link href="/terms">terms</Link>.
      </p>
    </LegalPage>
  );
}
