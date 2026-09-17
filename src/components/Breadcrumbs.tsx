import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";

export type Crumb = {
  href: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ href: "/", label: "Home" }, ...items];

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-ink-soft">
          {trail.map((crumb, index) => {
            const last = index === trail.length - 1;
            return (
              <li key={`${crumb.href}-${crumb.label}`} className="flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">/</span>}
                {last ? (
                  <span aria-current="page" className="font-semibold text-ink">
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="underline-offset-4 hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            item: absoluteUrl(crumb.href),
          })),
        }}
      />
    </>
  );
}
