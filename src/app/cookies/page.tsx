import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { BUSINESS } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Cookies",
  description:
    "Squeaky Solutions does not use analytics or ad cookies. The only cookie is an admin login session.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" path="/cookies">
      <p>
        This site does not use advertising cookies, analytics, or social
        embeds. There is no cookie consent popup because there is nothing extra
        to turn on.
      </p>
      <h2>What we set</h2>
      <p>
        <strong>Admin session only.</strong> If you log in at{" "}
        <Link href="/admin">/admin</Link>, we set one HTTP-only cookie so the
        desk stays signed in for about a week. Visitors who never open admin
        do not get that cookie from us.
      </p>
      <p>
        We do not set cookies when you book, send an inquiry, or just browse.
        Booking details go to our database so we can do the job — that’s
        explained in the <Link href="/privacy">privacy policy</Link>.
      </p>
      <h2>What we don’t do</h2>
      <ul>
        <li>No Google Analytics, Meta Pixel, or similar trackers</li>
        <li>No YouTube / Maps / chat embeds</li>
        <li>No “remember this ad” cookies</li>
      </ul>
      <h2>Your browser</h2>
      <p>
        Your browser may still store its own data (for example, to remember
        form fields). That’s yours to clear in browser settings.
      </p>
      <p>
        Questions:{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>
    </LegalPage>
  );
}
