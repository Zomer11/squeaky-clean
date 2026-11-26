import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BUSINESS.name} — Brisbane mobile car detailing`,
    short_name: BUSINESS.name,
    description: BUSINESS.tagline,
    start_url: "/",
    display: "browser",
    background_color: "#0b0b0d",
    theme_color: "#0b0b0d",
    lang: "en-AU",
    icons: [
      {
        src: "/logo.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
