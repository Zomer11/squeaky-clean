import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Cancellations & refunds",
  description:
    "Cancel a Squeaky Solutions booking for free until 6pm the day before. Pay on the day, so there is usually nothing to refund.",
  path: "/refunds",
});

export default function RefundsPage() {
  return (
    <LegalPage title="Cancellations & refunds" path="/refunds">
      <p>
        You pay on the day, once we’re done — cash or card. No deposit, nothing
        upfront, so there’s usually nothing to refund.
      </p>
      <h2>Need to cancel?</h2>
      <p>
        Cancel free up to <strong>6pm the day before</strong> (Brisbane time).
        Call{" "}
        <a href={`tel:${BUSINESS.phone.replace(/\s/g, "")}`}>{BUSINESS.phone}</a>{" "}
        or email{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, or use the{" "}
        <Link href="/contact">contact form</Link>.
      </p>
      <p>
        Cancelling later, or the car’s not there when we arrive? No fee — we’ll
        just give your slot to someone else.
      </p>
      <h2>If we need to reschedule</h2>
      <p>
        Storms, unsafe access, a blocked driveway, a locked gate with no code,
        or a dog we can’t work around — we’ll move your booking. No charge, no
        penalty.
      </p>
      <h2>If you stop us mid-job</h2>
      <p>
        If you ask us to stop partway through, we may charge for the time and
        product used — and we’ll tell you the amount before we leave.
      </p>
      <h2>Not happy with something?</h2>
      <p>
        Spot anything missed, or a mark we left? Tell us as soon as you can —
        ideally before we leave — and we’ll come back and fix it, free. We can’t
        fix swirl marks that were already in the paint, or weather that hits
        after we’ve gone.
      </p>
      <p>
        Full booking rules are in our <Link href="/terms">Terms</Link>.
      </p>
    </LegalPage>
  );
}
