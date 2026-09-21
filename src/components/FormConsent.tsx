import Link from "next/link";

type Props = {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
};

export function FormConsent({ id, checked, onChange }: Props) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-cream/60 p-3 text-sm leading-snug"
    >
      <input
        id={id}
        name="consent"
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-fresh-deep"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
      />
      <span>
        I agree to the{" "}
        <Link href="/privacy" className="font-semibold text-fresh-deep underline">
          privacy policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="font-semibold text-fresh-deep underline">
          terms
        </Link>
        . We only keep what we need to run the job.
      </span>
    </label>
  );
}
