import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Privacy",
  description:
    "What Squeaky Solutions collects when you book a Brisbane driveway detail, why we keep it, and how to ask us to delete it.",
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
        <li>Name and Australian mobile (required — we text the booking confirmation and may call)</li>
        <li>Street address and suburb (so we turn up at the right driveway)</li>
        <li>Vehicle type, package, frequency, date and slot</li>
        <li>Optional email and notes (make, colour, dogs, hose tap)</li>
        <li>A record that you agreed to this notice and our terms (timestamp)</li>
      </ul>
      <p>
        When you inquire: name, phone, message, optional email / suburb, and
        the same consent timestamp.
      </p>
      <p>
        We do not ask for card numbers on this site. Payment is on the day.
      </p>
      <h2>Why we keep it</h2>
      <p>
        To run the booking, text you a confirmation, email the job to our desk,
        and keep a simple job history. Admin access is password-protected. We
        don’t sell the number or put it on a marketing list.
      </p>
      <h2>Where it lives and who helps us</h2>
      <p>
        Bookings and inquiries sit in our business database on the server that
        hosts this site. To run the service we also use:
      </p>
      <ul>
        <li>
          <strong>Twilio</strong> — sends your booking confirmation SMS. Your
          mobile number and a short confirmation message go to Twilio (a
          US-linked processor).
        </li>
        <li>
          <strong>Google (Gmail SMTP)</strong> — emails the job or inquiry to
          our desk inbox. Name, contact details, address, and notes go in that
          email.
        </li>
      </ul>
      <p>
        We don’t send your details to a marketing list or an advertising
        network. Hosting and those two processors are the only places this
        operational data goes.
      </p>
      <h2>Cookies and browser storage</h2>
      <p>
        No analytics or ad cookies. The only cookie we set is an admin login
        session if someone uses the ops desk. After you book, your browser may
        briefly keep a confirmation summary in session storage (masked mobile,
        slot, suburb) so the thanks page can show it — that stays on your
        device and clears when the tab session ends. Details:{" "}
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
        <Link href="/terms">terms</Link>. The server will not accept a booking
        or inquiry without that yes, and we store when you agreed.
      </p>
    </LegalPage>
  );
}
