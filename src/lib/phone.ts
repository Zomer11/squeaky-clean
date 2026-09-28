/** Australian mobile → E.164 (+61…). Landlines return null. */
export function parseAuMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let national = "";
  if (digits.startsWith("61") && digits.length === 11) {
    national = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 10) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  } else {
    return null;
  }
  if (!national.startsWith("4") || national.length !== 9) return null;
  return `+61${national}`;
}

export function formatAuMobile(e164: string): string {
  if (!e164.startsWith("+61") || e164.length !== 12) return e164;
  const local = `0${e164.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function maskMobile(e164: string): string {
  if (e164.length < 6) return "••••";
  return `${e164.slice(0, 5)}••••${e164.slice(-3)}`;
}
