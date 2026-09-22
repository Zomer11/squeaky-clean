export type PhotoSlide = {
  src: string;
  alt: string;
  pos: string;
};

/** Unused on hero, packages, wash-plate, or cabin CTA. */
export const REEL_SLIDES: readonly PhotoSlide[] = [
  {
    src: "/media/suds-pink.jpg",
    alt: "Sedan under pink foam at night",
    pos: "center 58%",
  },
  {
    src: "/media/cloth-hood.jpg",
    alt: "Microfiber cloth on a black bonnet",
    pos: "42% 38%",
  },
  {
    src: "/media/foam-macro.jpg",
    alt: "Foam on a wing mirror",
    pos: "center 45%",
  },
];
