import Image from "next/image";

type Props = { className?: string; compact?: boolean };

/** Auto Care Detailing logo: the foam-car badge + set type. */
export function Wordmark({ className = "", compact = false }: Props) {
  return (
    <span className={`wordmark ${compact ? "wordmark--compact" : ""} ${className}`}>
      <Image
        src="/logo-mark.png"
        alt=""
        width={800}
        height={401}
        className="wordmark-car"
        priority
      />
      <span className="wordmark-type">
        <span className="wordmark-a">Auto Care</span>
        <span className="wordmark-b">Detailing</span>
      </span>
    </span>
  );
}
