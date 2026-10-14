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
  photo?: string;
  photoPos?: string;
  kicker?: string;
};

export function PageMast({
  title,
  crumbs,
  children,
  width = "narrow",
  scene,
  photo,
  photoPos = "center 50%",
  kicker,
}: Props) {
  const style = photo
    ? ({
        "--mast-photo": `url("${photo}")`,
        "--mast-pos": photoPos,
      } as React.CSSProperties)
    : undefined;

  return (
    <header
      className={`page-mast${scene && !photo ? ` page-mast--${scene}` : ""}`}
      style={style}
    >
      <div
        className={`mx-auto px-4 py-12 md:px-6 md:py-16 ${
          width === "wide" ? "max-w-6xl" : "max-w-3xl"
        }`}
      >
        <Breadcrumbs items={crumbs} tone="on-ink" />
        {kicker ? <p className="mast-kicker">{kicker}</p> : null}
        <h1 className="font-display text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
          {title}
        </h1>
        {children ? (
          <div className="page-mast-lead mt-4 max-w-2xl text-[1.25rem] font-medium leading-relaxed">
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
