import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { SkipLink } from "@/components/SkipLink";
import { StickyBookBar } from "@/components/StickyBookBar";
import { BUSINESS } from "@/lib/constants";
import { localBusinessJsonLd } from "@/lib/schema";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import "./redesign.css";

// Self-hosted (no Google Fonts request at build or runtime).
const display = localFont({
  variable: "--font-display",
  src: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
  weight: "100 900",
  display: "swap",
});

const body = localFont({
  variable: "--font-body",
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  display: "swap",
});

const ui = localFont({
  variable: "--font-ui",
  src: [
    { path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../../node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2", weight: "500" },
  ],
  display: "swap",
});

const description =
  "Auto Care Detailing — showroom finish at your Brisbane driveway. Inside + outside bundles, or exterior / interior only. Book morning or afternoon online. Pay on the day.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${BUSINESS.name} | Brisbane mobile car detailing`,
    template: `%s | ${BUSINESS.name}`,
  },
  description,
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  keywords: [
    "mobile car detailing Brisbane",
    "driveway car wash Brisbane",
    "car detailing Sunday",
    "Auto Care Detailing",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} | Brisbane mobile car detailing`,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} | Brisbane mobile car detailing`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${ui.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <JsonLd data={localBusinessJsonLd()} />
        <SkipLink />
        <Header />
        <main id="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <StickyBookBar />
      </body>
    </html>
  );
}
