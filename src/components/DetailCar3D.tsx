import type { CSSProperties } from "react";
import type { VehicleId } from "@/lib/constants";

const PAINT: Record<VehicleId, { body: string; dark: string; glass: string }> = {
  hatch: { body: "#e39b12", dark: "#c47f08", glass: "#8ec4c8" },
  sedan: { body: "#1a2430", dark: "#0f141a", glass: "#9bb8c4" },
  suv: { body: "#0f8f88", dark: "#0a6e69", glass: "#b7d4d6" },
  ute: { body: "#3d4a5c", dark: "#1a2430", glass: "#a8bcc4" },
};

type Props = {
  vehicle?: VehicleId;
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
  const paint = PAINT[vehicle];

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
      <div className={`car3d ${dirty ? "is-dirty" : "is-clean"} ${vehicle}`}>
        <div className="car3d-shadow" />
        <div className="car3d-cabin" />
        <div className="car3d-body" />
        {vehicle === "ute" && <div className="car3d-tray" />}
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
