import { DONATION } from "@/lib/constants";

type Props = {
  tone?: "on-cream" | "on-ink";
};

export function GiveBack({ tone = "on-cream" }: Props) {
  const onInk = tone === "on-ink";
  return (
    <aside
      className={`give-back ${onInk ? "give-back--ink" : ""}`}
      aria-labelledby="give-back-title"
    >
      <h2 id="give-back-title" className="give-back-title">
        {DONATION.title}
      </h2>
      <p className="give-back-lead">{DONATION.lead}</p>
    </aside>
  );
}
