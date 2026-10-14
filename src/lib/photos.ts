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
    src: "/media/rim-brush.jpg",
    alt: "Brush working foam into a car wheel",
    pos: "center 50%",
    title: "Wheels first",
    body: "Own brush, own bucket. Brake dust never touches your paint.",
    credit: "FindByPlate",
    creditUrl: "https://unsplash.com/photos/Ce_gQ7Z0eAc",
  },
  {
    src: "/media/interior-steam.jpg",
    alt: "Detailer steam-cleaning a steering wheel",
    pos: "center 40%",
    title: "Touchpoints",
    body: "Wheel, shifter, handles, buttons. The bits your hands live on.",
    credit: "Fine Automotive Detailing",
    creditUrl: "https://unsplash.com/photos/0a36BVNdWek",
  },
  {
    src: "/media/polisher.jpg",
    alt: "Machine polisher on a dark bonnet",
    pos: "center 60%",
    title: "Panel by panel",
    body: "Worked in sections, checked in daylight, not under a torch.",
    credit: "Tyler",
    creditUrl: "https://unsplash.com/photos/-35HMviKlzk",
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
