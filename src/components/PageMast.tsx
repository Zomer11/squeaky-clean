import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";

export type MastScene =
  | "book"
  | "areas"
  | "services"
  | "jobs"
  | "faq"
  | "about"
  | "contact"
  | "donation";

type Props = {
  title: string;
  crumbs: Crumb[];
  children?: React.ReactNode;
  width?: "narrow" | "wide";
  /** Unique hero still for this page mast. */
  scene?: MastScene;
};

export function PageMast({
  title,
  crumbs,
  children,
  width = "narrow",
  scene,
}: Props) {
  return (
    <header
      className={`page-mast${scene ? ` page-mast--${scene}` : ""}`}
    >
      <div
        className={`mx-auto px-4 py-12 md:px-6 md:py-16 ${
          width === "wide" ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <Breadcrumbs items={crumbs} tone="on-ink" />
        <h1 className="font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
          {title}
        </h1>
        {children ? (
          <div className="page-mast-lead mt-4 max-w-2xl text-[1.05rem] leading-relaxed">
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
