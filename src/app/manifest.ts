import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Brisbane mobile car detailing`,
    short_name: BUSINESS.name,
    description: BUSINESS.tagline,
    start_url: "/",
    display: "browser",
    background_color: "#f6f0e4",
    theme_color: "#e39b12",
    lang: "en-AU",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
