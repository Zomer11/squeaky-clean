import type { PackageId, SizeId } from "@/lib/constants";

export type TypicalJob = {
  id: string;
  suburb: string;
  region: string;
  vehicle: SizeId;
  packageId: PackageId;
  title: string;
  story: string;
  window: string;
};

/**
 * Composite driveway jobs — not named customers, not reviews.
 * Swap for real write-ups (and phone photos) once you have them.
 */
export const TYPICAL_JOBS: TypicalJob[] = [
  {
    id: "west-end-hatch",
    suburb: "West End",
    region: "Inner Brisbane",
    vehicle: "small",
    packageId: "good",
    title: "Hatch reset before a road trip",
    story:
      "City runabout, pollen on the paint, crumbs in the rails. The Essentials on a Sunday morning: foam wash, wheels, vacuum, wipe-down. Car left on the drive with the tap on.",
    window: "Sunday morning",
  },
  {
    id: "carindale-suv",
    suburb: "Carindale",
    region: "Southside",
    vehicle: "medium",
    packageId: "exterior-basic",
    title: "Family SUV on a fortnightly wash",
    story:
      "School run dust and weekend sports film. Exterior Basic — foam wash, glass, tyre shine — then a maintenance slot so it doesn’t go grey between washes.",
    window: "Saturday afternoon",
  },
  {
    id: "wynnum-ute",
    suburb: "Wynnum",
    region: "East",
    vehicle: "large",
    packageId: "interior-basic",
    title: "Work ute after a dusty week",
    story:
      "Dual-cab that lives on job sites. Interior Basic: vacuum, mats, dash, inside glass. Tray stays as-is unless you ask. Notes said the dog goes inside before we start.",
    window: "Thursday morning",
  },
];
