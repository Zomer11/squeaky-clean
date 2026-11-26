type Props = { className?: string; compact?: boolean };

/** Auto Care Detailing wordmark: a single spray-sweep mark + set type. */
export function Wordmark({ className = "", compact = false }: Props) {
  return (
    <span className={`wordmark ${compact ? "wordmark--compact" : ""} ${className}`}>
      <svg viewBox="0 0 32 32" className="wordmark-mark" aria-hidden>
        <path d="M16 3c5.5 7 9 12.2 9 16.4A9 9 0 0 1 7 19.4C7 15.2 10.5 10 16 3Z" fill="currentColor" />
        <path d="M11.5 20.5c1 2.6 3 3.9 5.6 4" stroke="#0a0b0d" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
      <span className="wordmark-type">
        <span className="wordmark-a">Auto Care</span>
        <span className="wordmark-b">Detailing</span>
      </span>
    </span>
  );
}
