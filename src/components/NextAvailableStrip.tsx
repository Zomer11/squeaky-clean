import Link from "next/link";
import { formatDateLabel, formatSlotLabel, getNextAvailable } from "@/lib/booking";

export async function NextAvailableStrip() {
  const next = await getNextAvailable();

  return (
    <div className="strip-pulse border-b border-line bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-2.5 text-sm sm:flex-row sm:items-center md:px-6">
        <p className="font-medium">
          <span className="mr-2 inline-block rounded-full bg-sun px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink">
            Next open
          </span>
          {next ? (
            <>
              {formatDateLabel(next.date)} · {formatSlotLabel(next.slot)} ·{" "}
              {next.remaining === 1
                ? "1 spot left"
                : `${next.remaining} spots left`}
            </>
          ) : (
            <>No open slots in the next 6 weeks — send an inquiry.</>
          )}
        </p>
        <Link
          href={next ? "/book" : "/contact"}
          className="font-semibold text-sun-on-ink underline-offset-4 hover:underline"
        >
          {next ? "Book this slot" : "Send an inquiry"}
        </Link>
      </div>
    </div>
  );
}
