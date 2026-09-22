import Image from "next/image";

/**
 * Unique photos only — never reused on hero/packages.
 * Array is doubled for seamless scroll; those are the same slots looping.
 */
const RIBBON = [
  { src: "/media/foam-wheel.jpg", alt: "" },
  { src: "/media/driveway.jpg", alt: "" },
] as const;

export function PhotoRibbon() {
  return (
    <div className="photo-ribbon" aria-hidden>
      <div className="photo-ribbon-track">
        {[...RIBBON, ...RIBBON].map((shot, i) => (
          <div key={`${shot.src}-${i}`} className="photo-ribbon-frame">
            <Image
              src={shot.src}
              alt=""
              fill
              sizes="280px"
              className="object-cover"
              priority={i < 2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
