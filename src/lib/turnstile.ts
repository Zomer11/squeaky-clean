import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** On only when both keys are set, so local dev and un-configured deploys keep working. */
export function turnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim(),
  );
}

/** Fails closed: if Cloudflare can't be reached, the submission is refused. */
export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!.trim(),
    response: token,
  });
  if (/^[0-9a-fA-F:.]+$/.test(ip)) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
