import Image from "next/image";

type Props = {
  /** Rendered height in px. Width follows the logo-mark aspect ratio (800 x 401). */
  size?: number;
  className?: string;
  priority?: boolean;
};

const ASPECT = 800 / 401;

export function BrandMark({ size = 40, className = "", priority = false }: Props) {
  const width = Math.round(size * ASPECT);
  return (
    <Image
      src="/logo-mark.png"
      alt=""
      width={width * 2}
      height={size * 2}
      quality={95}
      className={className}
      style={{ width, height: size }}
      priority={priority}
    />
  );
}
