import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PhotoReel } from "@/components/PhotoReel";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Photo drafts",
    description: "Scratch layouts for leftover Squeaky photos. Not in the nav.",
    path: "/look",
    index: false,
  }),
};

export default function LookPage() {
  return (
    <div className="pb-16">
      <div className="section-pad mx-auto max-w-6xl !pb-6">
        <h1 className="font-display text-4xl font-semibold">Photo drafts</h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Scratch pad. Home already uses Film. Pick one of the others if you
          want it swapped in.
        </p>
        <nav className="look-nav" aria-label="Drafts">
          <a href="#film">Film</a>
          <a href="#night">Night plate</a>
          <a href="#pair">Hood + mirror</a>
          <Link href="/">Back to home</Link>
        </nav>
      </div>

      <section id="film">
        <div className="section-pad mx-auto max-w-6xl !py-6">
          <h2 className="font-display text-2xl font-semibold">Film</h2>
          <p className="mt-2 max-w-lg text-ink-soft">
            One frame at a time under the hero. Pink foam, cloth, then the
            mirror. This one is live on the homepage.
          </p>
        </div>
        <PhotoReel />
      </section>

      <section id="night" className="mt-16">
        <div className="section-pad mx-auto max-w-6xl !py-6">
          <h2 className="font-display text-2xl font-semibold">Night plate</h2>
          <p className="mt-2 max-w-lg text-ink-soft">
            The pink BMW as its own full-bleed, same job as the white coupe
            plate. Dark lot, headlights on.
          </p>
        </div>
        <figure className="night-plate">
          <Image
            src="/media/suds-pink.jpg"
            alt="Sedan under pink foam at night"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <figcaption>Night foam. Same driveway, different hour.</figcaption>
        </figure>
      </section>

      <section id="pair" className="mt-16">
        <div className="section-pad mx-auto max-w-6xl !py-6">
          <h2 className="font-display text-2xl font-semibold">Hood + mirror</h2>
          <p className="mt-2 max-w-lg text-ink-soft">
            Cloth on the bonnet next to the foam-covered mirror. Two leftover
            close-ups as a spread, not a ticker.
          </p>
        </div>
        <figure className="hood-pair">
          <div className="hood-pair-cell">
            <Image
              src="/media/cloth-hood.jpg"
              alt="Microfiber cloth on a black bonnet"
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "42% 38%" }}
            />
          </div>
          <div className="hood-pair-cell hood-pair-cell--mirror">
            <Image
              src="/media/foam-macro.jpg"
              alt="Foam on a wing mirror"
              fill
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover"
              style={{ objectPosition: "center 45%" }}
            />
          </div>
          <figcaption>Wipe down, then the last pass on the glass.</figcaption>
        </figure>
      </section>
    </div>
  );
}
