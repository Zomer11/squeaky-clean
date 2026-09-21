import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Brisbane mobile car detailing`,
    short_name: BUSINESS.name,
    description: BUSINESS.tagline,
    start_url: "/",
    display: "browser",
    background_color: "#eef2f6",
    theme_color: "#0c1014",
    lang: "en-AU",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
