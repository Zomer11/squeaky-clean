import type { FaqItem } from "@/lib/faq";

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl border border-line bg-paper px-4 py-3"
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
