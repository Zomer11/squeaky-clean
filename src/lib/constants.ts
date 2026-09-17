export const BUSINESS = {
  name: "Squeaky Clean",
  tagline: "Mobile car detailing. Brisbane driveways. Duck approved.",
  phone: "0400 000 000",
  email: "hello@squeakyclean.au",
  abn: "00 000 000 000",
  hours: "7 days · Morning & afternoon · Sundays too",
  payNote: "Pay on the day — cash or card. No online payment needed.",
} as const;

export const VEHICLES = [
  {
    id: "hatch" as const,
    label: "Hatch / small",
    blurb: "Light cars, city runabouts.",
  },
  {
    id: "sedan" as const,
    label: "Sedan",
    blurb: "Four-door daily drivers.",
  },
  {
    id: "suv" as const,
    label: "SUV / 4WD",
    blurb: "Family wagons and off-roaders.",
  },
  {
    id: "ute" as const,
    label: "Ute / van",
    blurb: "Work trucks, dual-cabs, vans.",
  },
];

export const PACKAGES = [
  {
    id: "exterior" as const,
    label: "Exterior",
    blurb: "Hand wash, wheels, glass, tyre shine. Dust and traffic film gone.",
  },
  {
    id: "interior" as const,
    label: "Interior",
    blurb: "Vacuum, wipe-down, mats, glass inside. Food crumbs don’t stand a chance.",
  },
  {
    id: "full" as const,
    label: "Full detail",
    blurb: "Outside and in. The reset when the car’s been living a life.",
  },
];

export type VehicleId = (typeof VEHICLES)[number]["id"];
export type PackageId = (typeof PACKAGES)[number]["id"];
export type Frequency = "one-off" | "fortnightly" | "monthly";
export type Slot = "am" | "pm";

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
    id: "fortnightly",
    label: "Fortnightly",
    blurb: "Keep the daily driver looking washed, not neglected.",
  },
  {
    id: "monthly",
    label: "Monthly",
    blurb: "A regular tidy so Brisbane dust doesn’t win.",
  },
];

/** Brisbane mobile-detailing rates shown on the public card. */
export const PRICING = {
  currency: "AUD",
  gstNote: "Prices include GST.",
  packageBase: {
    exterior: 85,
    interior: 95,
    full: 189,
  } as Record<PackageId, number>,
  vehicleExtra: {
    hatch: 0,
    sedan: 15,
    suv: 40,
    ute: 45,
  } as Record<VehicleId, number>,
  frequencyOff: {
    "one-off": 0,
    monthly: 0.12,
    fortnightly: 0.18,
  } as Record<Frequency, number>,
} as const;

export function estimatePrice(
  pkg: PackageId,
  vehicle: VehicleId,
  frequency: Frequency,
): number {
  const raw = PRICING.packageBase[pkg] + PRICING.vehicleExtra[vehicle];
  const off = PRICING.frequencyOff[frequency];
  return Math.round(raw * (1 - off));
}

export function packageLabel(id: string): string {
  return PACKAGES.find((p) => p.id === id)?.label ?? id;
}

export function vehicleLabel(id: string): string {
  return VEHICLES.find((v) => v.id === id)?.label ?? id;
}
