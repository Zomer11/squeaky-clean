import { DONATION } from "@/lib/constants";

type Props = {
  tone?: "on-cream" | "on-ink";
};

const FLAGS = [
  { src: "/media/flags/palestine.svg", alt: "Flag of Palestine" },
  { src: "/media/flags/sudan.svg", alt: "Flag of Sudan" },
  { src: "/media/flags/lebanon.svg", alt: "Flag of Lebanon" },
] as const;

export function GiveBack({ tone = "on-cream" }: Props) {
  const onInk = tone === "on-ink";
  return (
    <aside
      className={`give-back ${onInk ? "give-back--ink" : ""}`}
      aria-labelledby="give-back-title"
    >
      <div className="give-back-top">
        <div className="give-back-heading">
          <div className="give-back-flags">
            {FLAGS.map((flag) => (
              <img
                key={flag.src}
                src={flag.src}
                alt={flag.alt}
                className="give-back-flag"
              />
            ))}
          </div>
          <p className="give-back-tag">Donation</p>
        </div>
        <p className="give-back-causes">Palestine · Sudan · Lebanon</p>
      </div>
      <h2 id="give-back-title" className="give-back-title">
        <span className="give-back-pct">{DONATION.percent}%</span>
        <span className="give-back-of">donated every job</span>
      </h2>
      <p className="give-back-lead">{DONATION.lead}</p>
    </aside>
  );
}
