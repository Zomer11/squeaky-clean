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

export type CraftTile = PhotoSlide & {
  title: string;
  body: string;
  credit: string;
  creditUrl: string;
};

/** Unsplash License — attribution not required, kept as a courtesy. */
export const CRAFT_TILES: readonly CraftTile[] = [
  {
    src: "/media/craft-wheel-foam.jpg",
    alt: "Foam running over a black alloy wheel",
    pos: "center 55%",
    title: "Wheels first",
    body: "Own brush, own bucket. Brake dust never touches your paint.",
    credit: "Zac Nielson",
    creditUrl: "https://unsplash.com/photos/a-close-up-of-a-car-tire-on-a-wet-surface-m5g2IFRouCs",
  },
  {
    src: "/media/craft-steering.jpg",
    alt: "Steering wheel and dash in an empty cabin",
    pos: "center 42%",
    title: "Touchpoints",
    body: "Wheel, shifter, handles, buttons. The bits your hands live on.",
    credit: "Jonathan Arbely",
    creditUrl: "https://unsplash.com/photos/the-steering-wheel-and-dashboard-of-a-car-Le1kCApAw4A",
  },
  {
    src: "/media/craft-panel.jpg",
    alt: "Microfiber cloth on glossy red paint",
    pos: "center 48%",
    title: "Panel by panel",
    body: "Worked in sections, checked in daylight, not under a torch.",
    credit: "GoGoNano",
    creditUrl: "https://unsplash.com/photos/gray-microfiber-cloth-resting-on-a-red-car-bDBiGYkr3h8",
  },
  {
    src: "/media/cabin-wheel.jpg",
    alt: "Clean steering wheel and dash in golden light",
    pos: "center 50%",
    title: "Hand back",
    body: "Walkaround with you before we pack up. Missed a spot? We fix it.",
    credit: "Titi Iaru",
    creditUrl: "https://unsplash.com/photos/q3S91TLNku8",
  },
];
