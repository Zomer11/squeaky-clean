import Link from "next/link";
import { ThanksDetails } from "@/components/ThanksDetails";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Thanks",
  description: "Your Squeaky Solutions booking or inquiry is in.",
  path: "/thanks",
  index: false,
});

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: raw } = await searchParams;
  const kind = raw === "inquiry" ? "inquiry" : "booking";

  return (
    <div className="section-pad mx-auto max-w-2xl">
      <div className="card noise p-6 md:p-8">
        <p className="chip">{kind === "inquiry" ? "Inquiry sent" : "Booked"}</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
          {kind === "inquiry" ? "Got it." : "You’re on the run."}
        </h1>
        <ThanksDetails kind={kind} />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
          {kind === "booking" ? (
            <Link href="/book" className="btn btn-primary">
              Book another
            </Link>
          ) : (
            <Link href="/book" className="btn btn-accent">
              Or just book a slot
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
