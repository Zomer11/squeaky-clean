import Link from "next/link";
import { DetailCar3D } from "@/components/DetailCar3D";
import { PageMast } from "@/components/PageMast";
import { RelatedLinks } from "@/components/RelatedLinks";
import { TYPICAL_JOBS } from "@/lib/jobs";
import { packageLabel, vehicleLabel } from "@/lib/constants";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Typical jobs",
  description:
    "How a Squeaky Solutions driveway detail usually looks in Brisbane — small, medium, large. Composite jobs, not customer reviews.",
  path: "/jobs",
});

export default function JobsPage() {
  return (
    <>
      <PageMast
        title="Typical jobs, not testimonials"
        crumbs={[{ href: "/jobs", label: "Typical jobs" }]}
        width="wide"
      >
        <p>
          These are composite Sunday-style jobs so you can see the work — not
          named customers, not star ratings. Real phone photos go here once we
          have permission to use them.
        </p>
      </PageMast>
      <div className="section-pad mx-auto max-w-6xl !pt-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {TYPICAL_JOBS.map((job) => (
            <article key={job.id} className="flex flex-col border-t border-line pt-5">
              <div className="flex justify-center py-2" aria-hidden>
                <DetailCar3D vehicle={job.vehicle} size="md" />
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-fresh-deep">
                {job.suburb} · {job.region}
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold">{job.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {job.story}
              </p>
              <p className="mt-4 text-sm font-semibold text-ink">
                {packageLabel(job.packageId)} · {vehicleLabel(job.vehicle)} ·{" "}
                {job.window}
              </p>
              <Link
                href={`/book?suburb=${encodeURIComponent(job.suburb)}`}
                className="btn btn-primary mt-5 w-full"
              >
                Book a similar slot
              </Link>
            </article>
          ))}
        </div>

        <RelatedLinks
          links={[
            {
              href: "/services",
              label: "Packages & prices",
              blurb: "Exterior, interior, full detail.",
            },
            {
              href: "/areas",
              label: "Your suburb",
              blurb: "See if we already run your street.",
            },
          ]}
        />
      </div>
    </>
  );
}
