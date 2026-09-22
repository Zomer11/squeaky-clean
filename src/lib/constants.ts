export const BUSINESS = {
  name: "Squeaky Solutions",
  tagline: "Showroom finish. Brisbane driveways.",
  phone: "0400 000 000",
  email: "hello@squeakysolutions.au",
  abn: "00 000 000 000",
  hours: "7 days · Morning & afternoon · Sundays too",
  payNote: "Pay on the day — cash or card. No online payment needed.",
} as const;

export const SIZES = [
  {
    id: "small" as const,
    label: "Small",
    blurb: "Hatchbacks and small sedans — Toyota Corolla, Mazda2.",
  },
  {
    id: "medium" as const,
    label: "Medium",
    blurb: "Mid-size sedans, wagons, small SUVs — Toyota Camry, Mazda CX-5.",
  },
  {
    id: "large" as const,
    label: "Large",
    blurb: "Large SUVs, utes, 7-seaters, vans — Toyota Prado, Ford Ranger.",
  },
];

/** Stored in the bookings.vehicle column. */
export const VEHICLES = SIZES;

export const PACKAGES = [
  {
    id: "good" as const,
    family: "combined" as const,
    grade: "Good",
    label: "The Essentials",
    tier: "Combined",
    time: "1–1.5 hrs",
    blurb: "A proper clean, inside and out. The one we start people on.",
    who: "Weekly dust, a sale tidy, or the car just looks tired.",
    includes: [
      "Full exterior foam wash",
      "Wheels and rims cleaned",
      "Tyre shine",
      "Windows cleaned inside and out",
      "Full vacuum — seats, floors, boot",
      "Dash, console and door cards wiped down",
    ],
    notIncluded: [
      "Clay / iron decon",
      "Seat and carpet shampoo",
      "Machine polish / paint correction",
      "Multi-year ceramic coating",
    ],
    prices: { small: 120, medium: 140, large: 160 },
  },
  {
    id: "better" as const,
    family: "combined" as const,
    grade: "Better",
    label: "The Full Detail",
    tier: "Combined",
    time: "2.5–3.5 hrs",
    blurb: "Everything in Good, plus a deeper clean and real protection.",
    who: "Most popular. The reset when the daily has been living a life.",
    includes: [
      "Everything in The Essentials",
      "Wheels and rims deep cleaned",
      "Iron and brake-dust removal",
      "Ceramic spray protection on paint",
      "Interior surfaces UV protected",
      "Leather cleaned and conditioned",
      "Carpet and upholstery shampooed",
      "Crevices and vents detailed",
    ],
    notIncluded: [
      "Clay bar / water-spot removal (that’s The Full Treatment)",
      "Machine polish / paint correction",
      "Multi-year ceramic coating",
      "Engine bay",
    ],
    prices: { small: 220, medium: 260, large: 300 },
  },
  {
    id: "best" as const,
    family: "combined" as const,
    grade: "Best",
    label: "The Full Treatment",
    tier: "Combined",
    time: "4–5 hrs",
    blurb: "Everything in Better, plus decontamination and serious protection.",
    who: "Presale, neglected daily, or you want it to feel new — not just tidy.",
    includes: [
      "Everything in The Full Detail",
      "Clay bar decontamination",
      "Water-spot removal",
      "Enhanced ceramic spray protection on paint",
      "Stain treatment",
      "Odour treatment",
    ],
    notIncluded: [
      "Machine polish / paint correction",
      "Multi-year ceramic coating",
      "Engine bay",
      "Ozone machine, headlights, tint",
    ],
    prices: { small: 380, medium: 440, large: 500 },
  },
  {
    id: "exterior-basic" as const,
    family: "exterior" as const,
    grade: "Basic",
    label: "Exterior Basic",
    tier: "Exterior",
    time: "45–75 min",
    blurb: "Foam wash, glass, wheels, jambs. Dust and traffic film gone.",
    who: "You only need the outside done.",
    includes: [
      "Foam wash",
      "Windows and windscreen, in and out",
      "Wheel clean and tyre shine",
      "Door and boot jambs",
    ],
    notIncluded: [
      "Interior",
      "Clay / iron decon",
      "Machine polish",
      "Engine bay",
    ],
    prices: { small: 80, medium: 95, large: 110 },
  },
  {
    id: "exterior-premium" as const,
    family: "exterior" as const,
    grade: "Premium",
    label: "Exterior Premium",
    tier: "Exterior",
    time: "1.5–2.5 hrs",
    blurb: "Basic plus clay, iron fallout, and a ceramic spray sealant.",
    who: "Paint feels rough, or you want protection on the wash.",
    includes: [
      "Everything in Exterior Basic",
      "Clay bar decontamination",
      "Iron and brake-dust removal",
      "Ceramic spray / sealant on paint",
    ],
    notIncluded: [
      "Interior",
      "Machine polish / paint correction",
      "Multi-year ceramic coating",
      "Engine bay",
    ],
    prices: { small: 180, medium: 210, large: 240 },
  },
  {
    id: "interior-basic" as const,
    family: "interior" as const,
    grade: "Basic",
    label: "Interior Basic",
    tier: "Interior",
    time: "45–75 min",
    blurb: "Vacuum, wipe, glass inside. Food crumbs don’t stand a chance.",
    who: "School run, crumbs, dusty dash. Not a flood.",
    includes: [
      "Full vacuum — including under seats",
      "Wipe-down of all surfaces",
      "Interior glass",
    ],
    notIncluded: [
      "Exterior wash",
      "Seat and carpet shampoo (Interior Premium)",
      "Odour treatment",
      "Pet hair quoted when we have the tools",
    ],
    prices: { small: 70, medium: 85, large: 100 },
  },
  {
    id: "interior-premium" as const,
    family: "interior" as const,
    grade: "Premium",
    label: "Interior Premium",
    tier: "Interior",
    time: "1.5–2.5 hrs",
    blurb: "Basic plus shampoo, leather, and odour treatment.",
    who: "Stains, leather that’s gone dull, or it smells like last summer.",
    includes: [
      "Everything in Interior Basic",
      "Seat and carpet shampoo",
      "Leather conditioning",
      "Odour treatment",
    ],
    notIncluded: [
      "Exterior wash",
      "Ozone machine",
      "Pet hair until we have the tools",
      "Engine bay",
    ],
    prices: { small: 160, medium: 190, large: 220 },
  },
  {
    id: "maintenance" as const,
    family: "maintenance" as const,
    grade: "Plan",
    label: "Maintenance plan",
    tier: "Regular",
    time: "45–75 min",
    blurb: "Quick exterior wash, tyre shine, interior vacuum and wipe, windows. A standing slot so it doesn’t go grey.",
    who: "You already had a proper detail. Now keep it.",
    includes: [
      "Quick exterior wash",
      "Tyre shine",
      "Interior vacuum and wipe-down",
      "Windows",
    ],
    notIncluded: [
      "Clay / iron / shampoo (book a detail)",
      "Doesn’t stack with the regulars card",
      "One-off visits — pick a bundle or one side only",
    ],
    prices: { small: 60, medium: 70, large: 85 },
  },
];

export type SizeId = (typeof SIZES)[number]["id"];
export type VehicleId = SizeId;
export type PackageId = (typeof PACKAGES)[number]["id"];
export type Frequency = "one-off" | "weekly" | "fortnightly" | "monthly";
export type Slot = "am" | "pm";
export type PackageFamily = (typeof PACKAGES)[number]["family"];

export const FREQUENCIES: {
  id: Frequency;
  label: string;
  blurb: string;
}[] = [
  {
    id: "one-off",
    label: "One-off",
    blurb: "Sale, holiday, or it just looks cooked.",
  },
  {
    id: "weekly",
    label: "Weekly",
    blurb: "Maintenance plan only.",
  },
  {
    id: "fortnightly",
    label: "Fortnightly",
    blurb: "Maintenance plan — the usual standing slot.",
  },
  {
    id: "monthly",
    label: "Monthly",
    blurb: "Maintenance plan — a regular tidy.",
  },
];

export const DETAIL_FREQUENCIES = ["one-off"] as const satisfies readonly Frequency[];
export const MAINTENANCE_FREQUENCIES = [
  "weekly",
  "fortnightly",
  "monthly",
] as const satisfies readonly Frequency[];

export const PRICING = {
  currency: "AUD",
  gstNote: "Prices include GST.",
  priceNote:
    "Fixed for the package and size you book, unless the car isn’t as described. We’ll confirm on the drive before we start.",
} as const;

export const MAINTENANCE_PRICES: Record<
  (typeof MAINTENANCE_FREQUENCIES)[number],
  Record<SizeId, number>
> = {
  weekly: { small: 50, medium: 60, large: 70 },
  fortnightly: { small: 60, medium: 70, large: 85 },
  monthly: { small: 75, medium: 90, large: 105 },
};

/** Punch-card offer. Ahmad marks it against the booking phone — no app. */
export const LOYALTY = {
  paidBeforeFree: 4,
  freeOn: 5,
  freePackage: "exterior-basic" as PackageId,
  title: "The regulars card",
  lead: "Same idea as the café stamp card. Four paid Exterior Basics, the fifth is on us — same size car.",
  how: "We mark it against the phone you book with. Put “regulars card” in the notes. We confirm on the drive.",
  limit:
    "Exterior Basic only for the free one. Doesn’t stack with the maintenance plan. One card per number.",
} as const;

export const EXTRAS = [
  { label: "Clay bar decontamination", price: "$50–$75", note: "Available now", soon: false },
  { label: "Water-spot removal", price: "$40–$60", note: "Available now", soon: false },
  { label: "Engine bay clean", price: "Coming soon", note: "Not on the kit yet", soon: true },
  { label: "Ozone odour treatment", price: "Coming soon", note: "Needs the machine", soon: true },
  { label: "Pet hair removal", price: "Coming soon", note: "Needs the tools", soon: true },
  { label: "Paint correction / machine polish", price: "Coming soon", note: "No DA polisher yet", soon: true },
  { label: "Headlight restoration", price: "Coming soon", note: "Add-on later", soon: true },
] as const;

export const DONATION = {
  percent: 10,
  cause: "Palestine",
  title: "10%",
  lead: "That's a donation from us — taken out of the job total, not an extra tip on your bill.",
} as const;

const OLD_PACKAGE_ALIASES: Record<string, PackageId> = {
  exterior: "exterior-basic",
  interior: "interior-basic",
  full: "good",
  premium: "best",
  hatch: "good",
};

export function isMaintenance(pkg: PackageId): boolean {
  return pkg === "maintenance";
}

export function estimatePrice(
  pkg: PackageId,
  size: SizeId,
  frequency: Frequency = "one-off",
): number {
  if (pkg === "maintenance") {
    const freq =
      frequency === "one-off" ? "fortnightly" : frequency;
    return MAINTENANCE_PRICES[freq][size];
  }
  const row = PACKAGES.find((p) => p.id === pkg);
  return row?.prices[size] ?? 0;
}

export function packageLabel(id: string): string {
  return PACKAGES.find((p) => p.id === id)?.label ?? id;
}

export function vehicleLabel(id: string): string {
  return SIZES.find((s) => s.id === id)?.label ?? id;
}

export function resolvePackageId(raw: string | undefined): PackageId {
  if (!raw) return "good";
  if (PACKAGES.some((p) => p.id === raw)) return raw as PackageId;
  return OLD_PACKAGE_ALIASES[raw] ?? "good";
}

export const PACKAGE_IDS = PACKAGES.map((p) => p.id) as [
  PackageId,
  ...PackageId[],
];

export const SIZE_IDS = SIZES.map((s) => s.id) as [SizeId, ...SizeId[]];

export const COMBINED_PACKAGES = PACKAGES.filter((p) => p.family === "combined");
export const EXTERIOR_PACKAGES = PACKAGES.filter((p) => p.family === "exterior");
export const INTERIOR_PACKAGES = PACKAGES.filter((p) => p.family === "interior");
