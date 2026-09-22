import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GiveBackPopup } from "@/components/GiveBackPopup";
import { JsonLd } from "@/components/JsonLd";
import { SkipLink } from "@/components/SkipLink";
import { StickyBookBar } from "@/components/StickyBookBar";
import { BUSINESS } from "@/lib/constants";
import { localBusinessJsonLd } from "@/lib/schema";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const description =
  "Squeaky Solutions — showroom finish at your Brisbane driveway. Inside + outside bundles, or exterior / interior only. Book morning or afternoon online. Pay on the day.";

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
    "Squeaky Solutions",
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
  themeColor: "#0c1014",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} h-full`}
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
        <GiveBackPopup />
      </body>
    </html>
  );
}
