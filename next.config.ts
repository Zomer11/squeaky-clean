import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const turnstile = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  ? " https://challenges.cloudflare.com"
  : "";

// No nonce-based CSP on purpose: nonces force every page to render per request,
// which throws away static caching — the cheapest defence against traffic floods.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${turnstile}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${turnstile}`,
  `frame-src ${turnstile ? turnstile.trim() : "'none'"}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "media-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), hid=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    qualities: [75, 95],
  },
  async headers() {
    const privateHeaders = [
      { key: "Cache-Control", value: "no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin", headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
    ];
  },
};

export default nextConfig;
