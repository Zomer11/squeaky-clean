import Image from "next/image";

export function HeroCrest() {
  return (
    <div className="hero-crest">
      <Image
        src="/logo.png"
        alt=""
        width={640}
        height={640}
        quality={95}
        priority
        className="hero-crest-img"
      />
    </div>
  );
}
