type Props = {
  size?: number;
  className?: string;
  /** bob = float loop, waddle = side sway */
  mood?: "bob" | "waddle" | "still";
};

/**
 * Squeaky Clean mascot — rubber duck, not a stock emoji.
 */
export function SqueakyDuck({
  size = 64,
  className = "",
  mood = "bob",
}: Props) {
  return (
    <div
      className={`squeaky-duck squeaky-duck--${mood} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <ellipse cx="60" cy="108" rx="38" ry="6" fill="rgba(26,36,48,0.12)" />
        {/* body */}
        <ellipse cx="58" cy="72" rx="36" ry="28" fill="#f5c518" />
        <ellipse
          cx="48"
          cy="68"
          rx="14"
          ry="18"
          fill="#ffe566"
          opacity="0.55"
        />
        {/* wing */}
        <ellipse
          cx="78"
          cy="74"
          rx="14"
          ry="10"
          fill="#e0a800"
          transform="rotate(-18 78 74)"
        />
        {/* head */}
        <circle cx="78" cy="42" r="22" fill="#f7cb22" />
        <circle cx="70" cy="38" r="8" fill="#ffe566" opacity="0.5" />
        {/* beak */}
        <ellipse cx="98" cy="46" rx="12" ry="7" fill="#f07818" />
        <ellipse cx="98" cy="44" rx="12" ry="4" fill="#ff9a3c" />
        {/* eye */}
        <circle cx="82" cy="38" r="5.5" fill="#1a2430" />
        <circle cx="83.5" cy="36.5" r="2" fill="#fff" />
        {/* cheek */}
        <circle cx="88" cy="48" r="4" fill="#ff8a6a" opacity="0.35" />
        {/* bubble / squeak spark */}
        <circle cx="28" cy="48" r="5" fill="#fff" opacity="0.85" />
        <circle cx="22" cy="38" r="3" fill="#fff" opacity="0.65" />
        <path
          d="M34 56 q6 2 4 8"
          fill="none"
          stroke="#0f8f88"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
