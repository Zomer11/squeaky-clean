import Image from "next/image";

const SHOTS = [
  {
    src: "/media/foam-wash.jpg",
    alt: "Sponge washing soapy glass on a black car",
    caption: "Foam on the glass",
  },
  {
    src: "/media/paint.jpg",
    alt: "Hand-washing a black car with two yellow buckets",
    caption: "Two-bucket wash",
  },
  {
    src: "/media/wheels.jpg",
    alt: "Detailer with a pressure lance next to a wet black car",
    caption: "Rinse",
  },
  {
    src: "/media/interior.jpg",
    alt: "Orange sports car parked on a driveway after a clean",
    caption: "Left on the drive",
  },
] as const;

export function DetailPhotos() {
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl font-semibold">On the driveway</h2>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        Stock stills until we’ve got permission to use our own phone photos.
        Unsplash / Pexels — not a customer’s car.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {SHOTS.map((shot) => (
          <li key={shot.src} className="overflow-hidden rounded-[1.15rem] bg-ink">
            <div className="relative aspect-[4/3]">
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="px-4 py-3 text-sm text-paper/85">{shot.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
