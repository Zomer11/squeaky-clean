import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const PATHS = [
  "/",
  "/services",
  "/areas",
  "/book",
  "/contact",
  "/about",
  "/faq",
  "/jobs",
  "/privacy",
  "/terms",
  "/cookies",
  "/refunds",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.map((path) => ({
    url: `${siteUrl()}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/book" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/book" || path === "/services" ? 0.9 : 0.6,
  }));
}
