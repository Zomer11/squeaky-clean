import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy",
  description:
    "What Squeaky Clean collects when you book a Brisbane driveway detail, why we keep it, and how to ask us to delete it.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" path="/privacy">
      <p>
        {BUSINESS.name} is a Brisbane mobile car-detailing run. We collect the
        least we can to book a job and talk to you. We don’t sell your details.
      </p>
      <h2>What we collect</h2>
      <p>When you book:</p>
      <ul>
        <li>Name and phone (so we can find you and confirm)</li>
        <li>Street address and suburb (so we turn up at the right driveway)</li>
        <li>Vehicle type, package, frequency, date and slot</li>
        <li>Optional email and notes (make, colour, dogs, hose tap)</li>
      </ul>
      <p>
        When you inquire: name, phone, message, and optional email / suburb.
      </p>
      <p>
        We do not ask for card numbers on this site. Payment is on the day.
      </p>
      <h2>Why we keep it</h2>
      <p>
        To run the booking, contact you about the slot, and keep a simple job
        history. Admin access is password-protected.
      </p>
      <h2>Where it lives</h2>
      <p>
        Bookings and inquiries sit in our business database on the server that
        hosts this site. We don’t send them to a marketing list or an overseas
        ad network.
      </p>
      <h2>Cookies and tracking</h2>
      <p>
        No analytics or ad cookies. The only cookie we set is an admin login
        session if someone uses the ops desk. Details:{" "}
        <Link href="/cookies">cookies</Link>.
      </p>
      <h2>Your choices</h2>
      <p>
        Email {BUSINESS.email} to see, correct, or delete what we hold on you,
        unless we need a record for a live or just-finished job. Australian
        Privacy Principles apply if we become an APP entity — this notice is
        written to the same spirit either way.
      </p>
      <p>
        Forms ask you to tick that you’ve read this page and the{" "}
        <Link href="/terms">terms</Link>. That’s so we have a clear yes, not
        so we can bury extra uses.
      </p>
    </LegalPage>
  );
}
