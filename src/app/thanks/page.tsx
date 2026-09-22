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
      <ThanksDetails kind={kind} />
    </div>
  );
}
