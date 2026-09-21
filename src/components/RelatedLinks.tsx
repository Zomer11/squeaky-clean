import Link from "next/link";

export type RelatedLink = {
  href: string;
  label: string;
  blurb: string;
};

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label="Related pages" className="mt-14">
      <h2 className="font-display text-2xl font-semibold">Keep going</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block h-full border-t border-line pt-4 hover:text-fresh-deep"
            >
              <span className="font-semibold text-fresh-deep">{link.label}</span>
              <span className="mt-1 block text-sm text-ink-soft">{link.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
