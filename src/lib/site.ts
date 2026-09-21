import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";

/** Intended live host until NEXT_PUBLIC_SITE_URL is set. */
export const DEFAULT_SITE_HOST = "squeakysolutions.au";

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return `https://${DEFAULT_SITE_HOST}`;
}

export function absoluteUrl(path = "/"): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalised === "/" ? "/" : normalised}`;
}

export function pageMeta({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: `${title} | ${BUSINESS.name}`,
      description,
      url,
      type: "website",
      locale: "en_AU",
      siteName: BUSINESS.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${BUSINESS.name}`,
      description,
    },
  };
}

export function isPublishedAbn(abn: string): boolean {
  return !/^0+$/.test(abn.replace(/\s/g, ""));
}
