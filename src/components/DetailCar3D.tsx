import type { CSSProperties } from "react";

export type CarKind = "hatch" | "sedan" | "suv" | "ute";

const PAINT: Record<CarKind, { body: string; dark: string; glass: string }> = {
  hatch: { body: "#47a9da", dark: "#1e6fa0", glass: "#b7d4e4" },
  sedan: { body: "#0c1014", dark: "#06080b", glass: "#9bb8c4" },
  suv: { body: "#2a8ec4", dark: "#164e78", glass: "#c5d5e0" },
  ute: { body: "#3e4a56", dark: "#0c1014", glass: "#a8bcc4" },
};

const FROM_SIZE: Record<string, CarKind> = {
  small: "hatch",
  medium: "sedan",
  large: "suv",
  hatch: "hatch",
  sedan: "sedan",
  suv: "suv",
  ute: "ute",
};

type Props = {
  vehicle?: string;
  dirty?: boolean;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
};

const SIZES = { sm: 88, md: 140, lg: 200 } as const;

export function DetailCar3D({
  vehicle = "sedan",
  dirty = false,
  size = "md",
  interactive = true,
  className = "",
}: Props) {
  const w = SIZES[size];
  const kind = FROM_SIZE[vehicle] ?? "sedan";
  const paint = PAINT[kind];

  return (
    <div
      className={`car3d-stage ${interactive ? "car3d-interactive" : ""} ${className}`}
      style={
        {
          width: w,
          height: w * 0.62,
          "--car-body": paint.body,
          "--car-dark": paint.dark,
          "--car-glass": paint.glass,
        } as CSSProperties
      }
      aria-hidden
    >
      <div className={`car3d ${dirty ? "is-dirty" : "is-clean"} ${kind}`}>
        <div className="car3d-shadow" />
        <div className="car3d-cabin" />
        <div className="car3d-body" />
        {kind === "ute" && <div className="car3d-tray" />}
        <div className="car3d-wheel car3d-wheel-fl" />
        <div className="car3d-wheel car3d-wheel-fr" />
        <div className="car3d-wheel car3d-wheel-rl" />
        <div className="car3d-wheel car3d-wheel-rr" />
        {!dirty && <div className="car3d-shine" />}
        {dirty && <div className="car3d-dust" />}
      </div>
    </div>
  );
}
