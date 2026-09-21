import Image from "next/image";

type Props = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandMark({ size = 40, className = "", priority = false }: Props) {
  return (
    <Image
      src="/logo.png"
      alt=""
      width={size * 2}
      height={size * 2}
      quality={95}
      className={className}
      style={{ width: size, height: size }}
      priority={priority}
    />
  );
}
