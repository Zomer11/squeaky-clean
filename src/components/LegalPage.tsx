import { Breadcrumbs } from "@/components/Breadcrumbs";

type Props = {
  title: string;
  path: string;
  updated?: string;
  children: React.ReactNode;
};

export function LegalPage({
  title,
  path,
  updated = "13 September 2026",
  children,
}: Props) {
  return (
    <div className="section-pad mx-auto max-w-3xl">
      <Breadcrumbs items={[{ href: path, label: title }]} />
      <h1 className="font-display text-4xl font-semibold text-pretty">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated {updated}</p>
      <div className="legal-prose mt-6 space-y-4 text-base leading-relaxed text-ink">
        {children}
      </div>
      <p className="mt-10 rounded-xl bg-cream-deep px-4 py-3 text-sm text-ink-soft">
        Starter wording for a local Brisbane service business. Not legal advice.
        Get a lawyer or accountant to sign off before you rely on it.
      </p>
    </div>
  );
}
