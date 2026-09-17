import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const alt = "Squeaky Clean — Brisbane mobile car detailing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #f6f0e4 0%, #ebe3d2 55%, #d9efe9 100%)",
          color: "#1a2430",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
            color: "#0a6e69",
          }}
        >
          Brisbane · mobile detailing
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              fontSize: 86,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {BUSINESS.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#3d4a5c",
              maxWidth: 860,
            }}
          >
            Your car. Your driveway. Exterior, interior, or a full reset —
            Sundays included.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#3d4a5c",
          }}
        >
          <span>Pay on the day</span>
          <span>7 days · AM / PM</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
