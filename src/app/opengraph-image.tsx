import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const alt = "Auto Care Detailing — Brisbane mobile car detailing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(70% 80% at 90% 10%, rgba(240, 86, 10, 0.28), transparent 55%), #0b0b0d",
          color: "#f1f1f2",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#f88830",
            }}
          >
            Brisbane · mobile detailing
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            {BUSINESS.name}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#c9cbce", maxWidth: 640 }}>
            Showroom finish. Your driveway. Pay on the day.
          </div>
        </div>
        <img src={logoSrc} width={400} height={400} alt="" />
      </div>
    ),
    { ...size },
  );
}
