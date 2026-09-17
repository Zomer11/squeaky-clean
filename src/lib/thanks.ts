export const THANKS_STORAGE_KEY = "squeaky-thanks";

export type ThanksPayload = {
  kind: "booking" | "inquiry";
  id?: number;
  date?: string;
  slot?: "am" | "pm";
  price?: number;
  vehicle?: string;
  package?: string;
  suburb?: string;
};

export function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapsDirectionsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
