import type { FaqItem, FaqSection } from "@/lib/faq";

function Items({ items }: { items: FaqItem[] }) {
  return (
    <div>
      {items.map((item) => (
        <details
          key={item.q}
          className="group border-b border-line px-0 py-4 first:pt-0"
        >
          <summary className="cursor-pointer list-none font-semibold text-ink [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-3">
              {item.q}
              <span
                aria-hidden
                className="mt-0.5 text-lg leading-none text-fresh-deep transition group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-soft">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}

export function FaqList({
  items,
  sections,
}: {
  items?: FaqItem[];
  sections?: FaqSection[];
}) {
  if (sections?.length) {
    return (
      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              {section.title}
            </h2>
            <div className="mt-4">
              <Items items={section.items} />
            </div>
          </section>
        ))}
      </div>
    );
  }

  return <Items items={items ?? []} />;
}
