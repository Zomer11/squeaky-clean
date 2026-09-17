import { BUSINESS, PACKAGES, PRICING, estimatePrice } from "@/lib/constants";
import { FAQS } from "@/lib/faq";
import { siteUrl } from "@/lib/site";

export function localBusinessJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutomotiveBusiness"],
    name: BUSINESS.name,
    description: BUSINESS.tagline,
    url,
    telephone: BUSINESS.phone.replace(/\s/g, ""),
    email: BUSINESS.email,
    image: `${url}/opengraph-image`,
    priceRange: `$${estimatePrice("exterior", "hatch", "one-off")}–$${estimatePrice("full", "ute", "one-off")}`,
    currenciesAccepted: "AUD",
    paymentAccepted: "Cash, Credit Card",
    areaServed: {
      "@type": "City",
      name: "Brisbane",
      containedInPlace: {
        "@type": "State",
        name: "Queensland",
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Brisbane",
      addressRegion: "QLD",
      addressCountry: "AU",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "07:00",
      closes: "18:00",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Mobile car detailing",
      itemListElement: PACKAGES.map((pkg) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: `${pkg.label} detail`,
          description: pkg.blurb,
        },
        priceCurrency: PRICING.currency,
        price: estimatePrice(pkg.id, "hatch", "one-off"),
      })),
    },
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
